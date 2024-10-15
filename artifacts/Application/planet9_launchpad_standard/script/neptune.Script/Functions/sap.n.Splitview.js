sap.n.Launchpad.Splitview = {

    saveCreate: true,
    fullscreen: false,
    orientation: "Horizontal",
    views: {},
    currentView: null,

    setSaveCreate: function(saveCreate) {
        this.saveCreate = saveCreate;
        this.saveSettingsToP9();
    },
    setFullscreen: function(fullscreen) {
        this.fullscreen = fullscreen;
        this.saveSettingsToP9();
    },
    setOrientation: function(orientation) {
        this.orientation = orientation;
        this.saveSettingsToP9();
    },

    invalidate: function() {
        $.each(this.views, function(key, view) {
            view.rerender = true;
        });
    },

    startup: function() {

        modelAppCacheSplitView.oData.forEach(splitview=>{

            sap.n.Launchpad.Splitview.load({
                id: splitview.SPLITVIEW,
                navTitle: splitview.TITLE,
                navInfo: splitview.INFO,
                splitapps: splitview.apps,
                saveToServer: true,
                orientation: splitview.ORIENTATION || "Horizontal",
                fullscreen: splitview.FULLSCREEN,
                loadInBackground: true
            });
        });
    },

    load: function(config) {

        var splitview = new sap.n.Splitview(config);

        this.views[config.id] = splitview;

        AppCache.Load("splitview", {
            // rootDir: '/public/views',
            rootDir: '/views/',
            load: "nav",
            navTitle: config.navTitle,
            navInfo: config.navInfo,
            navIconSrc: "sap-icon://screen-split-three",
            loadInBackground: (config.loadInBackground),
            appWidthLimited: !config.fullscreen,
            appGUID: config.id,
            startParams: {
                TITLE: config.navTitle,
                INFO: config.navInfo,
                orientation: config.orientation,
                splitview: splitview,
                callback: config.callback || function() {}
            }
        });
        if (config.loadInBackground) {
            splitview.initApps = config.splitapps || [];
            diaSplitviewApp.deleteSplitviewListCallback = function() {};
        } else {
            sap.n.Launchpad.setAppWidthLimited(!config.fullscreen);
            diaSplitviewApp.deleteSplitviewListCallback = function() {
                splitview.close();
            };
            if (!config.codeLoad) {
                splitview.appList();
            }
        }
        return splitview;
    },

    create: function(config) {

        config.id = "SPLITVIEW_" + Date.now();

        modelAppCacheSplitView.oData.push({
            SPLITVIEW: config.id,
            TITLE: config.navTitle,
            INFO: config.navInfo,
            ORIENTATION: config.orientation,
            FULLSCREEN: config.fullscreen
        });

        if (config.saveToServer) {
            neptune.Utils.userDefault.update({
                AREA: "LAUNCHPAD",
                GROUPING: "SPLITVIEW_DATA",
                NAME: AppCache.CurrentConfig,
                KEY0: "data",
                VAL0: JSON.stringify(modelAppCacheSplitView.oData)
            });
        }

        this.load(config);
    },

    saveSettingsToP9: function() {        
        neptune.Utils.userDefault.update({
            AREA: "LAUNCHPAD",
            GROUPING: "SPLITVIEW_OPTIONS",
            NAME: AppCache.CurrentConfig,
            KEY0: "settings",
            VAL0: sap.n.Launchpad.Splitview.orientation,
            BOL0: sap.n.Launchpad.Splitview.saveCreate,
            BOL1: sap.n.Launchpad.Splitview.fullscreen
        });
        diaSplitviewList.isDirty = true;
    }
};

/**
 * Splitview Class.
 * @since      5.5.6
 * @param {Object}  config                  Configuration object.
 * @param {String}  config.id               Splitview ID.
 * @param {Boolean} config.saveToServer     Save Splitview to ABAP server and load on each launchpad startup
 * @param {Boolean} config.fullscreen       Load Splitview fullscreen
 * @param {String}  config.navTitle         Splitview Title: Used in the left sidebar, in the headerbar & in the multi menu among open apps
 * @param {String}  config.navInfo          Splitview Info: Used in the left sidebar & in the headerbar
 */
sap.n.Splitview = function(config) {

    this.id = config.id;
    this.apps = [];
    this.saveToServer = config.saveToServer;
    this.orientation = config.orientation;
    this.fullscreen = config.fullscreen;
    this.size = 0;
    this.title = config.navTitle;
    this.info = config.navInfo;
    this.container;
    this.splitter;
    this.initApps = [],
    this.rerender = false,

    this.beforeClose = function(event, defaultAction, closeType) {
        var prevents = 0;
        var callbacks = [];
        var closeAction = function(callback) {
            --prevents;
            if (typeof callback === "function") callbacks.push(callback);
            if (prevents <= 0) {
                callbacks.forEach(callback=>{
                    callback();
                });
                defaultAction();
            }
        };
        return false;
    };

    this.beforeSuspend = function(event, id, config) {
        var prevents = 0;
        var callbacks = [];
        var defaultActionTmp = config.defaultAction;
        config.defaultAction = function(callback) {
            --prevents;
            if (typeof callback === "function") callbacks.push(callback);
            if (prevents <= 0) {
                callbacks.forEach(callback=>{
                    callback();
                });
                defaultActionTmp();
            }
        };
        return false;
    };

    this.beforeDisplay = function(data, options) {

        if (options.init) return;

        var that = this;
        if (this.initApps.length > 0) {
            this.initApps.forEach(app=>{

                var dataTile = modelAppCacheTiles.oData.find(obj => obj.id === app.GUID);
                if (dataTile) {
                    app.APPLID = dataTile.actionApplication;
                    app.START_PARAMS = dataTile.actionParameters;
                    that.add(app);
                }
            });
            this.initApps = [];
        }
        //when changing layout, the mainSplitter (container) will collapse, rerender when visible
        if (this.rerender) {
            var c = this.container;
            setTimeout(function() {
                c.rerender();
            }, 10);
        }
    };

    this.add = function(config) {

        var scrollContainer = new sap.m.ScrollContainer("__nep" + ModelData.genID(), {
            height: "100%",
            horizontal: false,
            vertical: true
        }).setLayoutData(new sap.ui.layout.SplitterLayoutData("__nep" + ModelData.genID(), {}));
        this.splitter.addContentArea(scrollContainer);

        this.apps.push({
            GUID: config.GUID,
            APPLID: config.APPLID,
            TILE_ICON: config.TILE_ICON,
            TILE_INFO: config.TILE_INFO,
            TILE_TITLE: config.TILE_TITLE,
            START_PARAMS: config.START_PARAMS || {},
            container: scrollContainer
        });
        this.resize();

        AppCache.Load(config.APPLID, {
            load: "splitview",
            splitviewId: this.id,
            parentObject: scrollContainer,
            navTitle: AppCacheShellAppTitle.getText(),
            startParams: config.START_PARAMS || {}
        });
    };

    this.close = function(id) {        
        modelAppCacheSplitView.oData = modelAppCacheSplitView.oData.filter(obj=>obj.SPLITVIEW !== id);
        this.saveToP9();
    };

    this.viewList = function() {
        var splitviewList = [];

        $.each(this.apps, function(i, app) {
            splitviewList.push(app);
        });

        modelTabSplitviewList.setData(splitviewList);

        inSplitviewListTitle.setValue(this.title);
        inSplitviewListDescription.setValue(this.info);
        inSplitviewListSave.setSelected(this.saveToServer);
        inSplitviewListFullscreen.setSelected(this.fullscreen);

        var that = this;
        diaSplitviewList.acceptSplitviewListCallback = function(config) {
            that.save(config);
        };
        diaSplitviewList.deleteSplitviewListCallback = function() {
            that.close();
        };
        diaSplitviewList.isDirtyCallback = function() {
            sap.n.Launchpad.setAppWidthLimited(!that.fullscreen);
        };

        diaSplitviewList.open();
    };

    this.appList = function() {

        var that = this;
        diaSplitviewApp.appListCallback = function(appList) {

            $.each(appList, function(i, app) {
                app.SPLITVIEW = that.id;
                that.add(app);
            });
            that.update();
        };
        diaSplitviewApp.open();
    };

    this.saveToP9 = function() {
        setCacheAppCacheSplitView();
        neptune.Utils.userDefault.update({
            AREA: "LAUNCHPAD",
            GROUPING: "SPLITVIEW_DATA",
            NAME: AppCache.CurrentConfig,
            KEY0: "data",
            VAL0: JSON.stringify(modelAppCacheSplitView.oData)
        });
    };

    this.delete = function() {
        modelAppCacheSplitView.oData = modelAppCacheSplitView.oData.filter(obj=>obj.SPLITVIEW !== this.id);
        this.saveToP9();
    };

    this.update = function() {
        if (this.saveToServer) {
            let splitview = modelAppCacheSplitView.oData.find(obj=>obj.SPLITVIEW === this.id);
            if (!splitview) {
                splitview = {
                    SPLITVIEW: this.id,
                    TITLE: this.title,
                    INFO: this.info,
                    ORIENTATION: this.orientation,
                    FULLSCREEN: this.fullscreen
                };
                modelAppCacheSplitView.oData.push(splitview);
            }
            
            splitview.FULLSCREEN = this.fullscreen;
            splitview.INFO = this.info;
            splitview.TITLE = this.title;

            splitview.apps = this.apps.map(app=>{
                return {
                    APPLID: app.APPLID,
                    GUID: app.GUID,
                    START_PARAMS: app.START_PARAMS,
                    TILE_ICON: app.TILE_ICON,
                    TILE_INFO: app.TILE_INFO,
                    TILE_TITLE: app.TILE_TITLE
                };
            });
            this.saveToP9();

        } else {
            this.delete();
        }
    };

    this.save = function(config) {

        this.title = config.title;
        this.info = config.info;
        this.saveToServer = config.saveToServer;
        this.orientation = config.orientation;
        this.fullscreen = config.fullscreen;

        var splitterSize = 0;
        $.each(this.splitter.getCalculatedSizes(), function(i, size) {
            splitterSize += size;
        });

        splitterSize += (this.apps.length - 1) * 4;

        this.apps = modelTabSplitviewList.oData;
        this.splitter.removeAllContentAreas();

        var that = this;
        $.each(this.apps, function(i, app) {
            that.splitter.addContentArea(app.container);
        });

        this.refresh();

        this.size = -1;
        this.resize(splitterSize);

        this.update();
    };


    this.resize = function(size) {

        if (size === 0) return;
        if (size > 0) {
            if (size === this.size) return; // size coming from the Splitter resize handler. refocus => splitter resizes from 0 to size
            this.size = size;
        }
        var that = this;

        setTimeout(function() {

            var splitterSize = 0;

            if (size) {

                //get splitter size from resize event handler
                splitterSize = size;
            } else {

                //get splitter size from the splitter object
                $.each(that.splitter.getCalculatedSizes(), function(i, size) {
                    splitterSize += size;
                });
            }

            // subtract drag handler width (4px)
            splitterSize = splitterSize - ((that.apps.length - 1) * 4);

            var containerSize = (splitterSize / that.apps.length).toFixed(4);

            $.each(that.apps, function(i, app) {
                app.container.getLayoutData().setSize(containerSize + "px");
            });

        }, 150);
    };
};
