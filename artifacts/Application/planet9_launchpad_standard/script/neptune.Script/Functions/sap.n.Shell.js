sap.n.getObjectByID = function (id) {
    let object;
    object = sap.ui.getCore().byId(sap.n.currentView.createId(id));
    return object;
};

sap.n.Shell = {
    openSidePanelApps: {},
    sidepanelCloseEvents: {},
    sidepanelHelpFunction: null,
};

sap.n.Shell.setUserText = (txt)=>{
    launchpadSettingsHeaderText.setText(AppCache.userInfo.name || AppCache.userInfo.username);
    AppCacheShellUserName.setText(AppCache.userInfo.name || AppCache.userInfo.username);
    msgNumpadUserMobile.setText(txt);
    msgNumpadUserDesktop.setText(txt);
};

// Event - attachInit
sap.n.Shell.attachInit = function (func) {
    let applid = AppCache.CurrentApp.replace(/\//g, "").toUpperCase();

    if (AppCache.LoadOptions.appGUID) applid = AppCache.LoadOptions.appGUID;
    if (!applid) return;
    if (!sap.n.Apps[applid]) sap.n.Apps[applid] = {};
    if (!sap.n.Apps[applid].init) sap.n.Apps[applid].init = new Array();

    sap.n.Apps[applid].init.push(func);
};

sap.n.Shell.attachBeforeSuspend = function (func) {
    let applid = AppCache.CurrentApp.replace(/\//g, "").toUpperCase();

    if (AppCache.LoadOptions.appGUID) applid = AppCache.LoadOptions.appGUID;
    if (!applid) return;
    if (!sap.n.Apps[applid]) sap.n.Apps[applid] = {};
    if (!sap.n.Apps[applid].beforeSuspend) sap.n.Apps[applid].beforeSuspend = new Array();

    sap.n.Apps[applid].beforeSuspend.push(func);
};

sap.n.Shell.attachBeforeMenuNavigation = function (func) {
    let applid = AppCache.CurrentApp.replace(/\//g, "").toUpperCase();

    if (AppCache.LoadOptions.appGUID) applid = AppCache.LoadOptions.appGUID;
    if (!applid) return;
    if (!sap.n.Apps[applid]) sap.n.Apps[applid] = {};
    if (!sap.n.Apps[applid].beforeMenuNavigation)
        sap.n.Apps[applid].beforeMenuNavigation = new Array();

    if (!sap.n.Apps[applid].beforeMenuNavigation.length)
        sap.n.Apps[applid].beforeMenuNavigation.push(func);
};

// Event - attachBeforeDisplay
sap.n.Shell.attachBeforeDisplay = function (func) {
    let applid = AppCache.CurrentApp.replace(/\//g, "").toUpperCase();

    if (AppCache.LoadOptions.appGUID) applid = AppCache.LoadOptions.appGUID;
    if (!applid) return;

    if (!sap.n.Apps[applid]) sap.n.Apps[applid] = {};
    if (!sap.n.Apps[applid].beforeDisplay) sap.n.Apps[applid].beforeDisplay = new Array();

    if (!sap.n.Apps[applid].beforeDisplay.length) sap.n.Apps[applid].beforeDisplay.push(func);
};

// Event - beforeClose
sap.n.Shell.attachBeforeClose = function (func) {
    let applid = AppCache.CurrentApp.replace(/\//g, "").toUpperCase();

    if (AppCache.LoadOptions.appGUID) applid = AppCache.LoadOptions.appGUID;
    if (!applid) return;
    if (!sap.n.Apps[applid]) sap.n.Apps[applid] = {};
    if (!sap.n.Apps[applid].beforeClose) sap.n.Apps[applid].beforeClose = new Array();

    if (!sap.n.Apps[applid].beforeClose.length) sap.n.Apps[applid].beforeClose.push(func);
};

// Event - attachOnNavigation
sap.n.Shell.attachOnNavigation = function (func) {
    let applid = AppCache.CurrentApp.replace(/\//g, "").toUpperCase();

    if (AppCache.LoadOptions.appGUID) applid = AppCache.LoadOptions.appGUID;
    if (!applid) return;
    if (!sap.n.Apps[applid]) sap.n.Apps[applid] = {};
    if (!sap.n.Apps[applid].onNavigation) sap.n.Apps[applid].onNavigation = new Array();

    if (!sap.n.Apps[applid].onNavigation.length) sap.n.Apps[applid].onNavigation.push(func);
};

// Event - beforeBack
sap.n.Shell.attachBeforeBack = function (func) {
    let applid = AppCache.CurrentApp.replace(/\//g, "").toUpperCase();

    if (AppCache.LoadOptions.appGUID) applid = AppCache.LoadOptions.appGUID;
    if (!applid) return;
    if (!sap.n.Apps[applid]) sap.n.Apps[applid] = {};
    if (!sap.n.Apps[applid].beforeBack) sap.n.Apps[applid].beforeBack = new Array();

    if (!sap.n.Apps[applid].beforeBack.length) sap.n.Apps[applid].beforeBack.push(func);
};

// Event - beforeHome
sap.n.Shell.attachBeforeHome = function (func) {
    let applid = AppCache.CurrentApp.replace(/\//g, "").toUpperCase();

    if (AppCache.LoadOptions.appGUID) applid = AppCache.LoadOptions.appGUID;
    if (!applid) return;
    if (!sap.n.Apps[applid]) sap.n.Apps[applid] = {};
    if (!sap.n.Apps[applid].beforeHome) sap.n.Apps[applid].beforeHome = new Array();

    if (!sap.n.Apps[applid].beforeHome.length) sap.n.Apps[applid].beforeHome.push(func);
};

sap.n.Shell.getTabKey = function (tabApplid, tabTitle, options) {
    if (tabApplid === "cockpit_doc_reader") return "cockpit_doc_reader";

    if (tabTitle) {
        return tabApplid + "|" + tabTitle;
    }

    if (
        options &&
        options.startParams &&
        options.startParams.settings &&
        options.startParams.settings.data &&
        options.startParams.settings.data.id
    ) {
        return options.startParams.settings.data.id;
    }

    return tabApplid;
};

sap.n.Shell.splitOpen = (param1, param2, param3, param4, param5)=>{

    if (!param1) return;

    let config;
    const splitapps = [];

    if (typeof param1 === "object") {
        config = param1;
    } else {
        config = {
            splitapps: [param1]
        };
        if (param2) config.splitapps.push(param2);
        if (param3) config.splitapps.push(param3);
        if (param4) config.splitapps.push(param4);
        if (param5) config.splitapps.push(param5);
    }

    config.splitapps.forEach(app => {

        const card = modelAppCacheTiles.oData.find(obj => obj.APPLID === app);
        if (card) {
            splitapps.push({
                APPLID: card.APPLID,
                GUID: card.GUID,
                TILE_ICON: card.TILE_ICON,
                TILE_INFO: card.TILE_INFO,
                TILE_TITLE: card.TILE_TITLE
            });
        }
    });

    let splitview;

    config.id = config.id || "SPLITVIEW" + Date.now();
    config.navTitle = config.navTitle || "Splitview";
    config.navInfo = config.navInfo || "Applications";
    config.orientation = config.orientation || "Horizontal";
    config.saveToServer = config.saveToServer || false;
    config.fullscreen = config.fullscreen || true;
    config.splitapps = splitapps;
    config.loadInBackground = config.loadInBackground || false;
    config.codeLoad = true;
    config.callback = ()=>{
        splitapps.forEach(app => splitview.add(app));
    };

    splitview = sap.n.Launchpad.Splitview.load(config);
};

/**
 * @function loadSidepanel                 : Load application in launchpad side panel
 * @param {String} tabApplid               : Application ID for the app to be loaded
 * @param {Object} [options={}]            : Options
 * @param {string} [options.tabTitle=""]   : Side panel tab title
 * @param {string} [options.tabId=""]      : Unique ID for panel tab. Can be used to open the same app in multiple tabs. Like sales documents
 * @param {Object} [options.startParams={}]: Start parameters to be passed on to the onInit and onBeforeDisplay application event handlers
 */
sap.n.Shell.loadSidepanel = (tabApplid, options) => {
    const tabKey = tabApplid.toUpperCase().replace(/\//g, "");
    let tabId = tabKey;
    let tabTitle = "";

    if (typeof options === "string") {
        tabTitle = options;
        options = {};
    } else {
        tabTitle = options.tabTitle || "";
        tabId = options.tabId || tabKey;
    }

    AppCacheShellSidepanel.setVisible(true);
    sap.n.Launchpad.sidepanelOpen();

    let tabContainerItem = AppCachePageSideTab.getItems().find((tab) => {
        return tab.getKey() === tabId;
    });

    if (tabContainerItem) {
        AppCachePageSideTab.setSelectedItem(tabContainerItem);

        const appsId = tabKey + "__nepSidepanel" + tabId;
        if (sap.n.Apps[appsId] && sap.n.Apps[appsId].beforeDisplay) {
            sap.n.Apps[appsId].beforeDisplay.forEach((data) => data(options.startParams));
        }
    } else {
        tabContainerItem = new sap.m.TabContainerItem("__nepSidepanel" + tabId, {
            key: tabId,
            modified: false,
            name: tabTitle,
        });

        AppCachePageSideTab.addItem(tabContainerItem);
        AppCachePageSideTab.setSelectedItem(tabContainerItem);

        options.parentObject = tabContainerItem;
        options.sidePanel = true;

        AppCache.Load(tabApplid, options);
    }
    setTimeout(() => AppCachePageSideTab.setSelectedItem(tabContainerItem));
};

sap.n.Shell.closeSidepanelTab = function (tabKey) {
    if (!tabKey) return;

    AppCachePageSideTab.getItems().forEach(function (tab) {
        if (tab.getKey() === tabKey) tab.destroy();
    });

    if (AppCachePageSideTab.getItems().length === 0) {
        sap.n.Launchpad.sidepanelClose();
    }
};

sap.n.Shell.closeAllSidepanelTabs = function () {
    const tabs = AppCachePageSideTab.getItems();
    if (tabs.length > 0) {
        tabs.forEach(function (tab) {
            tab.destroy();
        });

        sap.n.Launchpad.sidepanelClose();
    }
};

sap.n.Shell.setSidepanelText = function (name, additionalText) {
    let tabId = AppCachePageSideTab.getSelectedItem();

    AppCachePageSideTab.getItems().forEach(function (tab) {
        if (tab.sId === tabId) {
            if (name) tab.setName(name);
            if (additionalText) tab.setAdditionalText(additionalText);

            let app = tab.getKey().split("|")[0];
            tab.setKey(app + "|" + name);
        }
    });
};

sap.n.Shell.getSidepanelText = function () {
    let tabId = AppCachePageSideTab.getSelectedItem();
    let data = {};

    AppCachePageSideTab.getItems().forEach(function (tab) {
        if (tab.sId === tabId) {
            data.name = tab.getName();
            data.additionalText = tab.getAdditionalText();
        }
    });

    return data;
};

sap.n.Shell.closeSidepanel = function (tabKey) {
    sap.n.Launchpad.sidepanelClose();

    // Destroy when closing Tile
    if (tabKey) {
        AppCachePageSideTab.getItems().forEach(function (tab) {
            if (tab.getKey() === tabKey) tab.destroy();
        });
    }
};

sap.n.Shell.openSidepanel = function (tabKey) {
    sap.n.Launchpad.sidepanelOpen();
};

sap.n.Shell.showGuided = function (data) {
    let object = sap.ui.getCore().byId(sap.n.currentView.createId(data.FIELD_NAME));
    popGuided.openBy(object);
    popGuided.setTitle(data.STEP_TITLE);
    docGuided.setText(data.STEP_DOC);
};

// Close Tile
sap.n.Shell.closeTile = function (tileData) {
    if (typeof tileData !== "object" || !tileData.id) {
        return;
    }

    location.hash = "";

    // Destroy current App or URL
    if (tileData.actionURL || tileData.actionWebApp) {
        const iframe = querySelector(`#iFrame${tileData.id}`);
        iframe.parentNode.removeChild(iframe);

        // Navigate Back
        if (sap.n.Launchpad.currentTile.id === tileData.id) {
            AppCacheNav.back();
            sap.n.Launchpad.currentTile = {};

            if (tileData.sidepanelApp) sap.n.Shell.closeSidepanel(tileData.sidepanelApp);
            if (sap.n.Launchpad.isMenuPage() && !sap.n.Launchpad.hideBackIcon)
                AppCacheBackButton.setVisible(false);

            AppCacheShellHelp.setVisible(false);
            sap.n.Launchpad.setHideHeader(false);
        }
    } else {
        // Custom beforeClose
        let preventDefault = false;
        let viewID;

        if (sap.n.Apps[tileData.id] && sap.n.Apps[tileData.id].beforeClose) {
            sap.n.Apps[tileData.id].beforeClose.forEach(function (eventFn) {
                let oEvent = new sap.ui.base.Event("beforeClose", new sap.ui.base.EventProvider());
                eventFn(oEvent);

                if (oEvent.bPreventDefault) preventDefault = true;
                oEvent = null;
            });
        }

        // Default behaviour was avoided
        if (preventDefault) return;

        // Sidepanel
        if (AppCachePageSideTab.getItems().length === 0) {
            sap.n.Shell.closeSidepanel();
            AppCacheShellSidepanel.setVisible(false);
        }

        // Navigate Back
        if (sap.n.Launchpad.currentTile.id === tileData.id) {
            AppCacheNav.back();

            if (typeof AppCache.StartApp === "string" && AppCache.StartApp.trim().length > 0) {
                return;
            }

            sap.n.Launchpad.currentTile = {};

            // Delete SidepanelApps
            if (tileData.sidepanelApp) {
                sap.n.Shell.closeSidepanel(tileData.sidepanelApp);
                if (tileData.actionApplication)
                    delete sap.n.Shell.openSidePanelApps[tileData.actionApplication];
            }

            if (sap.n.Launchpad.isMenuPage() && !sap.n.Launchpad.hideBackIcon)
                AppCacheBackButton.setVisible(false);

            AppCacheShellHelp.setVisible(false);
            sap.n.Launchpad.setHideHeader(false);

            // Fullscreen Handling
            let cat = AppCacheNav.getCurrentPage().sId;
            cat = cat.split("page")[1];

            let dataCat = ModelData.FindFirst(AppCacheCategory, "id", cat);

            if (dataCat) {
                sap.n.Launchpad.MarkTopMenu(dataCat.id);
                sap.n.Launchpad.setAppWidthLimited(!dataCat.enableFullScreen);
            } else {
                let dataCatChild = ModelData.FindFirst(AppCacheCategoryChild, "id", cat);
                if (!dataCatChild) {
                    AppCache.Back();
                } else {
                    sap.n.Launchpad.handleAppTitle(dataCatChild.title);
                }
            }
        }

        // Clear View
        if (AppCache.View[tileData.id]) {
            viewID = AppCache.View[tileData.id].sId;
            AppCache.View[tileData.id].destroy();
            AppCache.View[tileData.id] = null;
            delete AppCache.View[tileData.id];
        }

        // Clear All Events
        delete sap.n.Apps[tileData.id];

        if (viewID) sap.n.Shell.clearObjects(viewID);
    }

    sap.n.Launchpad.deleteGlobaleActive({
        guid: tileData.id
    });

    // Close Active Button
    const containerOpenApp = sap.ui.getCore().byId(`${nepPrefix()}OpenAppContainer${tileData.id}`);
    if (containerOpenApp) {
        openApps.removeItem(containerOpenApp);
        containerOpenApp.destroy();
        openAppMaster.setVisible(openApps.getItems().length > 0);
    }

    // reset launchpad content and navigator width, if all open apps have been closed
    if (openApps.getItems().length === 0) {
        setTimeout(() => {
            sap.n.Layout.setHeaderPadding();
        }, 100);
    }

    // Destroy Buttons
    const btnByTileId = sap.ui.getCore().byId(`but${tileData.id}`);
    if (btnByTileId) btnByTileId.destroy();

    const btnTopByTileId = sap.ui.getCore().byId(`butTop${tileData.id}`);
    if (btnTopByTileId) btnTopByTileId.destroy();

    // SideBar
    // const items = blockRunningRow.getContent();
    // if (!items.length) closeContentNavigator();
    const items = navBarContent.getItems();
    if (!sap.n.Launchpad.showNavBar() || !items.length) {
        sap.n.Launchpad.setContentNavigatorWidth("0px");
        sap.n.Layout.setHeaderPadding();
    }

    // Close Objects Loaded into the App
    AppCache.ViewChild[tileData.id] &&
        AppCache.ViewChild[tileData.id].forEach(function (data) {
            sap.n.Shell.clearObjects(data.sId);
        });
    delete AppCache.ViewChild[tileData.id];

    sap.n.Launchpad.handleAppTitle(AppCache.launchpadTitle);
    sap.n.Layout.setHeaderPadding();
};

sap.n.Shell.closeAllTiles = function () {
    // Close all Tiles - Clear memory
    for (const k in AppCache.View) {
        let tile = ModelData.FindFirst(AppCacheTiles, "GUID", k);
        if (tile && tile.GUID) sap.n.Shell.closeTile(tile);
    }

    // Close AppCache.Load Apps
    for (const appId in sap.n.Apps) {
        if (AppCache.View[appId]) {
            AppCache.View[appId].destroy();
            AppCache.View[appId] = null;
            delete sap.n.Apps[appId];
        }
    }

    // Clear Pages
    AppCacheNav.getPages().forEach(function (data) {
        if (
            ![
                "AppCachePageMenu",
                "AppCachePageStore",
                "AppCache_boxURL",
                "AppCache_boxLogon",
                "AppCache_boxLogonCustom",
                "AppCache_boxPassword",
                "AppCache_boxPasscode",
                "AppCache_boxPasscodeEntry",
                "AppCache_boxUsers",
            ].includes(data.sId)
        ) {
            AppCacheNav.removePage(data.sId);
            data.destroy();
            data = null;
        }
    });

    // Clear Views
    AppCache.View = [];

    // Extra memory cleanup
    sap.n.Shell.clearAllObjects();

    sap.n.Shell.closeSidepanel();

    // Close Objects Loaded into the App
    AppCache.ViewChild["undefined"] &&
        AppCache.ViewChild["undefined"].forEach(function (data) {
            sap.n.Shell.clearObjects(data.sId);
        });

    delete AppCache.ViewChild["undefined"];

    // NavBar
    // blockRunningRow.destroyContent();
    navBarContent.destroyItems();
    menuHidden.removeAllItems();
    appsHidden.removeAllItems();

    sap.n.Layout.clearAppCacheAppButtonItems();
    openApps.removeAllItems();

    AppCache.Home();
};

sap.n.Shell.clearObjects = function (view) {
    sap.ui
        .getCore()
        .byFieldGroupId("")
        .forEach(function (data) {
            let id = data.getId().split("--");
            if (id[0] === view) {
                if (data.getDomRef()) data.getDomRef().remove();
                data.destroy();
                data = null;
            }
        });
};

sap.n.Shell.listPattern = function (object) {
    sap.ui
        .getCore()
        .byFieldGroupId("")
        .forEach(function (data) {
            if (!includesJSView(data.getId()) && data.getId().indexOf(object) > -1)
                console.log(data.getId());
        });
};

sap.n.Shell.clearAllObjects = function () {
    // JS Views
    sap.ui
        .getCore()
        .byFieldGroupId("")
        .forEach(function (data) {
            let id = data.getId().split("--");

            if (includesJSView(id[0])) {
                if (data.getDomRef()) data.getDomRef().remove();

                try {
                    if (typeof data.destroy === "function") data.destroy();
                } catch (e) {}

                data = null;
            }
        });

    // Objects created by javascript
    sap.ui
        .getCore()
        .byFieldGroupId("")
        .forEach(function (data) {
            if (!includesJSView(data.getId()) && hasNepPrefix(data.getId())) {
                if (data.getDomRef()) data.getDomRef().remove();

                try {
                    if (typeof data.destroy === "function") data.destroy();
                } catch (e) {}

                data = null;
            }
        });
};

sap.n.Shell.viewExists = function (view) {
    let found = false;
    sap.ui
        .getCore()
        .byFieldGroupId("")
        .forEach(function (data) {
            let id = data.getId().split("--");
            if (id[0] === view) found = true;
        });
    return found;
};

sap.n.Shell.listObjects = function () {
    sap.ui
        .getCore()
        .byFieldGroupId("")
        .forEach(function (data) {
            let id = data.getId().split("--");
            if (includesJSView(id[0])) console.log(data.getId());
        });
};

sap.n.Shell.openUrl = function (url, options) {
    // Load Defaults
    options = options || {};
    LoadOptions = {};
    LoadOptions.dialogHeight = options.dialogHeight || "90%";
    LoadOptions.dialogWidth = options.dialogWidth || "1200px";
    LoadOptions.dialogTitle = options.dialogTitle || "";
    LoadOptions.dialogModal = options.dialogModal || false;
    LoadOptions.webAppData = options.webAppData || null;

    let contHeight = LoadOptions.dialogHeight;
    let contWidth = LoadOptions.dialogWidth;
    let diaTitle = LoadOptions.dialogTitle;
    let screenWidth = window.innerWidth;

    // Less Than 1200px
    if (screenWidth < 1200) contWidth = screenWidth * 0.8 + "px";

    // On Mobile
    if (!sap.n.Launchpad.isDesktop()) {
        contWidth = "100%";
        contHeight = "100%";
    }

    // Create Dialog
    let dia = new sap.n.Dialog({
        contentWidth: contWidth,
        contentHeight: contHeight,
        type: "Message",
        resizable: !sap.n.Launchpad.isPhone(),
        draggable: !sap.n.Launchpad.isPhone(),
        stretchOnPhone: true,
        title: diaTitle,
        contentIsURL: true,
        afterClose: function (oEvent) {
            // Delete From Array
            for (let i = 0; i < AppCache.Dialogs.length; i++) {
                if (AppCache.Dialogs[i] === this.getId()) {
                    AppCache.Dialogs.splice(i, 1);
                    break;
                }
            }

            if (AppCache.Dialogs.length === 0) {
                AppCacheShellDialog.setVisible(false);
            }

            this.destroyContent();
            dia = null;
        },
    });

    // Add Dialog to Array
    AppCache.Dialogs.push(dia.getId());

    if (LoadOptions.webAppData) {
        let diaID = ModelData.genID();
        dia.addContent(
            new sap.ui.core.HTML(nepId(), {
                content: `<iframe id='diaFrame${diaID}' frameborder='0' height='100%' width='100%'></iframe>`,
                visible: true,
                sanitizeContent: false,
                preferDOM: false,
                afterRendering: function (oEvent) {
                    let frame = document.getElementById("diaFrame" + diaID);
                    frame.setAttribute("srcdoc", LoadOptions.webAppData);
                },
            })
        );
    } else {
        dia.addContent(
            new sap.ui.core.HTML(nepId(), {
                content: `<iframe frameborder='0' height='100%' width='100%' src='${url}'></iframe>`,
                visible: true,
                sanitizeContent: false,
                preferDOM: false,
            })
        );
    }

    dia.open();
};
