AppCache.Initialized = false;
AppCache.userInfo = "";
AppCache.CurrentApp = "";
AppCache.DelayOnRefreshingToken = {
    AppInTile: 50,
    AdaptiveApps: 50,
    SetUserInfo: 5,
};
AppCache.View = [];
AppCache.ViewChild = [];
AppCache.Dialogs = [];
AppCache.isOffline = false;
AppCache.isHCP = false;
AppCache.isRestricted = true;
AppCache.hcpDestination = "";
AppCache.StartApp = "";
AppCache.useMenu = true;
AppCache.Url = "";
AppCache.LoadOptions = {};
AppCache.diaView = "";
AppCache.loadQueue = [];
AppCache.enablePush = false;
AppCache.enableTrace = false;
AppCache.enableLogging = false;
AppCache.enableAutoLogin = false;
AppCache.showTFAError = false;
AppCache.logoutUrl = "";
AppCache.timerLock = 0;
AppCache.limitWidth = false;
AppCache.pushSenderId = "";
AppCache.hideTopHeader = false;
AppCache.hideGlobalAjaxError = false;
AppCache.setupResetHandler = false;
AppCache.sapCAICustomData = {};
AppCache.cssGridBreakpoints = {
    xxxlarge: 2360,
    xxlarge: 1880,
    xlarge: 1580,
    large: 1280,
    medium: 980,
    small: 680,
    xsmall: 380,
};
AppCache.sideMenuWidth = '300px';
AppCache.navBarWidth = '300px';
AppCache.enableFavorites = true;
AppCache.enableMostused = true;
// Mobile
AppCache.mobileClient = "";
AppCache.isMobile = false;
AppCache.enablePasscode = false;
AppCache.biometricAuthentication = false;
AppCache.passcodeLength = 4;
AppCache.numPasscode = 5;
AppCache.Encrypted = "";
AppCache.loginApp = "";
AppCache.inBackground = false;
AppCache.CurrentLayout = {};
AppCache.enableSystemTheme = true;
AppCache.initViewQueue = [];
AppCache._loadedApps = new Map(),

AppCache.enableNotif = true; //ENABLE_NOTIF
AppCache.keepNotifOnClick = false; //KEEP_NOTIF
AppCache.notifInterval = 60; //NOTIF_INTERVAL

/**
 * Load custom custom light and/or custom dark layout. 
 * As a default, a launchpad has one light and one dark layout. Use this method to load other layouts depending on launchpad usecase.
 * You can find the layout ID in the cockpit launchpad layout configuration tool.
 * @since      24.10
 * @param {Object}  config                  Configuration object.
 * @param {String}  config.idlayoutLight    Light layout ID.
 * @param {String}  config.idlayoutLight    Dark layout ID.
 */
AppCache.loadCustomLayouts = (config)=>{
    const arr = [];

    if (!!config?.layoutLight) arr.push(sap.n.Design.fetchLayout(config.layoutLight));
    if (!!config?.layoutDark) arr.push(sap.n.Design.fetchLayout(config.layoutDark));

    Promise.all(arr).then(layouts => {

        const user = modelAppCacheUsers.oData.find(obj=>obj.username === AppCache.userInfo.username);

        if (!!config?.layoutLight) {
            const layout = layouts.find(obj=>obj.id === config.layoutLight);
            if (!!layout) {
                
                modelAppCacheLayout.oData.layoutLight = layout;
                ModelData.Update(modelAppCacheLayout.oData.layouts, "id", modelAppCacheLayout.oData.layoutLight.id, modelAppCacheLayout.oData.layoutLight);
                    
                if (!!config.updateUser) {
                    AppCache.userInfo.layoutLight = modelAppCacheLayout.oData.layoutLight.id;
                    ModelData.Update(AppCacheUsers, "username", user.username, user);
                }
            }
        }
        if (!!config?.layoutDark) {
            const layout = layouts.find(obj=>obj.id === config.layoutDark);
            if (!!layout) {
                
                modelAppCacheLayout.oData.layoutDark = layout;
                ModelData.Update(modelAppCacheLayout.oData.layouts, "id", modelAppCacheLayout.oData.layoutDark.id, modelAppCacheLayout.oData.layoutDark);
                    
                if (!!config.updateUser) {
                    AppCache.userInfo.layoutDark = modelAppCacheLayout.oData.layoutDark.id;
                    ModelData.Update(AppCacheUsers, "username", user.username, user);
                }
            }
        }
        setCacheAppCacheLayout();  
        setCacheAppCacheUsers();

        sap.n.Design.loadLayout();
    });
};


AppCache.loadLibrary = function (url) {
    return new Promise(function (resolve) {
        request({
            type: "GET",
            url: url,
            success: function (data) {
                resolve("OK");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                resolve("ERROR");
            },
            dataType: "script",
            cache: true,
        });
    });
};

AppCache._loadQueue = function () {
    if (refreshingAuth) {
        setTimeout(() => {
            this._loadQueue();
        }, 10);
        return;
    }

    if (this.loadQueue.length === 0) return;

    let { APPLID, OPTIONS } = this.loadQueue[0];
    this.loadQueue.splice(0, 1);
    this.Load(APPLID, OPTIONS);
};

AppCache.Load = function (value, options) {
    appCacheLog(`AppCache.load: APPLID=${value}`);
    // Check Queue - Put in queue of working
    if (refreshingAuth) {
        let appData = {
            APPLID: value,
            OPTIONS: options || {},
        };
        this.loadQueue.push(appData);
        return;
    }

    this._loadedApps.set(value, Object.assign({}, options));

    // Format ID
    let applid = value.replace(/\//g, "");

    // Load Defaults
    options = options || {};

    AppCache.LoadOptions = {
        applid: applid,
        dialogShow: options.dialogShow || false,
        dialogHeight: options.dialogHeight || "90%",
        dialogWidth: options.dialogWidth || "1200px",
        dialogTitle: options.dialogTitle || "",
        dialogIcon: options.dialogIcon || "",
        dialogModal: options.dialogModal || false,
        dialogHideMinimize: options.dialogHideMinimize || false,
        dialogHideMosaic: options.dialogHideMosaic || false,
        dialogHideMaximize: options.dialogHideMaximize || false,
        onDialogClose: options.onDialogClose || function () {},
        load: options.load || "",
        parentObject: options.parentObject || "",
        appGUID: options.appGUID || "",
        appPath: options.appPath || "",
        appAuth: options.appAuth || "",
        appType: options.appType || "",
        startParams: options.startParams || "",
        openFullscreen: options.openFullscreen || false,
        appWidthLimited: options.appWidthLimited || false,
        hideHeader: options.hideHeader || false,
        rootDir: options.rootDir || "",
        sapICFNode: options.sapICFNode || "",
        defaultLanguage: options.defaultLanguage || "EN",
        
        loadInBackground: options.loadInBackground || false,
        splitviewId: options.splitviewId || "",
        navTitle: options.navTitle || "",
        navInfo: options.navInfo || "",
        navIconSrc: options.navIconSrc || "",
        navIconImg: options.navIconImg || "",

        navObjEventHandler: options.navObjEventHandler || {
            updateNavigationItemFn: function(){},
        }
    };
    if (!!AppCache.LoadOptions.openFullscreen) AppCache.LoadOptions.appWidthLimited = false;

    // Set Current App
    if (!AppCache.LoadOptions.loadInBackground) {
        AppCache.CurrentApp = value;
    }

    // Check for AppCache.Load when Remote System
    if (!AppCache.LoadOptions.appPath && sap.n.Launchpad.currentTile && sap.n.Launchpad.currentTile.urlApplication) {
        AppCache.LoadOptions.appPath = sap.n.Launchpad.currentTile.urlApplication;
        AppCache.LoadOptions.appType = sap.n.Launchpad.currentTile.urlType;
        AppCache.LoadOptions.appAuth = sap.n.Launchpad.currentTile.urlAuth;
    }

    if (!!AppCache.LoadOptions.parentObject) {

        AppCache.LoadOptions.parentObject.addStyleClass && AppCache.LoadOptions.parentObject.addStyleClass("nepParent");
        AppCache.LoadOptions.appGUID = applid + AppCache.LoadOptions.parentObject.getId();

        if (typeof AppCache.LoadOptions.parentObject.setBusy === "function") {
            AppCache.LoadOptions.parentObject.setBusy(true);
        }
    }

    AppCache.LoadOptions.defaultLanguage = getLaunchpadLanguage();

    // since we are lazy loading apps, multiple apps being loaded inside the tile will not have access to the correct AppCache.LoadOptions
    const loadOptions = Object.assign({}, AppCache.LoadOptions);
    
    if (loadOptions.load === "nav") {

        //splitview create ID on its own
        if (!loadOptions.appGUID) {
            loadOptions.appGUID = applid + "__nav" + new Date().getTime();
        }
    }

    // Get App from Memory
    if (!loadOptions.dialogShow && loadOptions.load !== "nav") {
        const viewName = getAppViewName(value, loadOptions.appPath);
        if (loadOptions.appGUID) {
            if (AppCache.View[loadOptions.appGUID]) {
                AppCache.buildView({ viewName, applid: value, loadOptions });
                return;
            }
        } else {
            if (AppCache.View[applid]) {
                AppCache.buildView({ viewName, applid: value, loadOptions });
                return;
            }
        }
    }

    if (loadOptions.load === "nav") {
        if (!loadOptions.loadInBackground) {
            sap.n.Launchpad.currentTile = {
                id: loadOptions.appGUID
            };
        }

        sap.n.Launchpad.setTileContentObject(loadOptions.appGUID);

        sap.n.Launchpad.handleNavButton({
            dataLoad: {
                applid: loadOptions.applid,
                appGUID: loadOptions.appGUID,
                navTitle: loadOptions.navTitle,
                navInfo: loadOptions.navInfo,
                navIconSrc: loadOptions.navIconSrc,
                navIconImg: loadOptions.navIconImg,
                startParams: loadOptions.startParams,
                navObjEventHandler: loadOptions.navObjEventHandler,
                appWidthLimited: loadOptions.appWidthLimited,
                hideHeader: loadOptions.hideHeader
            }
        });
    }

    // Get App from DB/LS if exist in repository
    this.loadView(value, loadOptions);
};

// try to load view from local browser repository or fetch it from backend
AppCache.loadView = function (value, loadOptions) {
    function fetchView() {
        AppCache.getView(value, loadOptions);
    }

    const app = ModelData.FindFirst(
        AppCacheData,
        ["application", "language", "appPath"],
        [value.toUpperCase(), getLaunchpadLanguage(), loadOptions.appPath]
    );
    if (!app) {
        return fetchView();
    }

    if (app.invalid && !AppCache.isOffline) {
        return fetchView();
    }

    let shouldFetchView = true;
    const viewName = getAppViewName(value, loadOptions.appPath);
    p9GetView(viewName)
        .then((data) => {
            if (typeof data !== "undefined" && data.length > 2) {
                shouldFetchView = false;
                AppCache.initView({ viewName, value, data, loadOptions });
            }
        })
        .catch((err) => {
            appCacheLog("AppCache.Load: catch, while trying to load view from p9GetView", err);
            const data = sapStorageGet(viewName);
            if (typeof data !== "undefined" && data !== null) {
                shouldFetchView = false;
                AppCache.initView({ viewName, value, data, loadOptions });
            }
        })
        .finally(() => {
            if (shouldFetchView) {
                fetchView();
            }
        });
};

AppCache.setGlobalAppGuidTo = function (guid) {
    AppCache.LoadOptions.appGUID = guid;
};

AppCache.LoadAdaptive = function (id, options) {
    if (!refreshingAuth) {
        AppCache.LoadAdaptiveApp(id, options);
        return;
    }

    setTimeout(() => {
        AppCache.LoadAdaptive(id, options);
    }, AppCache.DelayOnRefreshingToken.AdaptiveApps);
};

AppCache.LoadAdaptiveApp = function (id, options) {
    if (!options) options = {};

    neptune.Adaptive.getConfig(id).then(function (config) {
        // Exists ?
        if (!config) {
            sap.m.MessageToast.show(AppCache_tAdaptiveNotFound.getText());
            return;
        }

        // Merge from Options
        if (options && options.startParams) {
            if (options.startParams.data) config.settings.data = options.startParams.data;
            if (options.startParams.navigation)
                config.settings.navigation = options.startParams.navigation;
            if (options.startParams.events) config.settings.events = options.startParams.events;
        }

        AppCache.Load(config.application, {
            appGUID: ModelData.genID(),
            startParams: config,
            dialogShow: options.dialogShow || false,
            dialogHeight: options.dialogHeight || "90%",
            dialogWidth: options.dialogWidth || "1200px",
            dialogTitle: options.dialogTitle || "",
            dialogIcon: options.dialogIcon || "",
            dialogModal: options.dialogModal || false,
            dialogHideMinimize: options.dialogHideMinimize || false,
            dialogHideMosaic: options.dialogHideMosaic || false,
            dialogHideMaximize: options.dialogHideMaximize || false,
            load: options.load || "",
            parentObject: options.parentObject || "",
            appPath: options.appPath || "",
            appAuth: options.appAuth || "",
            appType: options.appType || "",
            openFullscreen: options.openFullscreen || false,
            rootDir: options.rootDir || "",
            sapICFNode: options.sapICFNode || "",
        });
    });
};

AppCache.LoadAdaptiveSidepanel = function (id, title, options) {
    if (!options) options = {};
    neptune.Adaptive.getConfig(id).then(function (config) {
        // Exists ?
        if (!config) {
            sap.m.MessageToast.show(AppCache_tAdaptiveNotFound.getText());
            return;
        }

        // Merge from Options
        if (options && options.startParams) {
            if (options.startParams.data) config.settings.data = options.startParams.data;
            if (options.startParams.navigation)
                config.settings.navigation = options.startParams.navigation;
            if (options.startParams.events) config.settings.events = options.startParams.events;
        }

        sap.n.Shell.loadSidepanel(config.application, {
            tabTitle: title,
            appGUID: ModelData.genID(),
            icon: options.icon || "",
            additionaltext: options.additionaltext || "",
            startParams: config
        });
    });
};

AppCache.LoadWebApp = function (value, options) {
    let dataTile = {
        actionWebApp: value,
        openFullscreen: true,
    };

    let dataCat = {};
    const viewName = getWebAppViewName(value, dataTile.urlApplication);
    const webApp = ModelData.FindFirst(
        AppCacheData,
        ["application", "appPath"],
        [dataTile.actionWebApp, dataTile.urlApplication]
    );

    if (webApp) {
        // Get App from Memory
        if (AppCache.View[viewName]) {
            AppCache.buildWebApp(dataTile, null, dataCat);
            return;
        }

        // Get App from Cache
        p9GetView(viewName)
            .then(function (viewData) {
                if (viewData.length > 10 && !webApp.invalid) {
                    AppCache.buildWebApp(dataTile, viewData, dataCat);
                } else {
                    AppCache.getWebApp(dataTile, dataCat);
                }
            })
            .catch(() => {
                let data = sapStorageGet(viewName);
                if (data && !webApp.invalid) {
                    AppCache.buildWebApp(dataTile, data, dataCat);
                } else {
                    AppCache.getWebApp(dataTile, dataCat);
                }
            });
    } else {
        AppCache.getWebApp(dataTile, dataCat);
    }
};

// AppCache Methods
AppCache.restrictedEnable = function () {
    // Objects
    AppCacheShellUserName.setText();
    AppCacheShellUserName.setVisible(false);
    AppCacheBackButton.setVisible(false);
    AppCacheUserActionSettings.setVisible(false);
    AppCacheShellMenuOverflow.setVisible(false);
    AppCacheShellHelp.setVisible(false);
    AppCacheUserActionChangePassword.setVisible(false);
    launchpadContentMenu.setWidth("0px");
    sap.n.Shell.closeSidepanel();
    sap.n.Shell.closeAllSidepanelTabs();
    sap.n.Launchpad.setLaunchpadContentWidth();
    sap.n.Launchpad.setSearchVisibility(false);

    sap.n.Shell.closeAllSidepanelTabs();
    sap.n.Shell.openSidePanelApps = {};
    
    launchpadContainer.removeStyleClass("nepLaunchpadHorizontalMenu");

    // NavBar
    navBarContent.destroyItems();
    menuHidden.removeAllItems();
    appsHidden.removeAllItems();

    modelAppCacheFavorites.setData({
        ENABLED: false,
        FAVORITES: []
    });
    modelAppCacheMostused.setData({
        ENABLED: false,
        MOSTUSED: []
    });

    // Turn off
    // blockRunningRow.destroyContent();
    sap.n.Layout.clearAppCacheAppButtonItems();

    // Close all Tiles - Clear memory
    for (let key in AppCache.View) {
        let tile = ModelData.FindFirst(AppCacheTiles, "GUID", key);
        if (tile && tile.GUID) sap.n.Shell.closeTile(tile);
    }

    // Close AppCache.Load Apps
    for (let key in sap.n.Apps) {
        if (AppCache.View[key]) {
            AppCache.View[key].destroy();
            AppCache.View[key] = null;
            delete sap.n.Apps[key];
        }
    }

    // Data
    modelAppCacheTiles.setData([]);
    modelAppCacheDiaSettings.setData([]);

    AppCache.userInfo = {};

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

    // Clear external URL
    let elem = document.getElementById("AppCache_URLDiv");
    if (elem) elem.innerHTML = "";

    // Clear Views
    AppCache.View = [];

    // Clear timers
    for (let key in sap.n.Launchpad.Timers) {
        clearInterval(sap.n.Launchpad.Timers[key].timer);
    }

    if (AppCacheLogonAzure.autoRelog) {
        clearInterval(AppCacheLogonAzure.autoRelog);
        AppCacheLogonAzure.autoRelog = null;
    }

    sap.n.Launchpad.Timers = [];
    sap.n.Launchpad.currentTile = {};
    sap.n.currentView = "";

    AppCache.isRestricted = true;
    location.hash = "";

    topMenu.setHeight("48px");

    // Close all Dialogs
    sap.m.InstanceManager.closeAllDialogs();

    // Extra memory cleanup
    sap.n.Shell.clearAllObjects();

    // Close Objects Loaded into the App
    AppCache.ViewChild["undefined"] &&
        AppCache.ViewChild["undefined"].forEach(function (data) {
            sap.n.Shell.clearObjects(data.sId);
        });

    delete AppCache.ViewChild["undefined"];

    // External Tools
    AppCache.disableExternalTools();

    // Adaptive
    if (!neptune.Adaptive) neptune.Adaptive = {};
    neptune.Adaptive.configurations = {};
    neptune.Adaptive.pages = {};
    neptune.Adaptive.dialogs = {};

    // Enhancement
    if (sap.n.Enhancement.RestrictedEnable) {
        try {
            sap.n.Enhancement.RestrictedEnable();
        } catch (e) {
            appCacheError("Enhancement RestrictedEnable " + e);
        }
    }
};

AppCache.saveChildView = function (view) {
    if (!sap.n.Launchpad.currentTile) return;
    if (!AppCache.ViewChild[sap.n.Launchpad.currentTile.id]) {
        AppCache.ViewChild[sap.n.Launchpad.currentTile.id] = [];
    }
    AppCache.ViewChild[sap.n.Launchpad.currentTile.id].push(view);
};

AppCache.translate = function (language) {
    // Handle Languages
    if (language === "NB") language = "NO";

    if (Array.isArray(AppCache.objects)) {
        AppCache.objects.forEach(function (object) {
            let obj = sap.ui.getCore().byId(object.fieldName);
            if (obj) {
                object.attributes.forEach(function (attribute) {
                    const translation = ModelData.FindFirst(
                        attribute.translation,
                        "language",
                        language
                    );

                    const firstLetter = attribute.attribute.charAt(0).toUpperCase();
                    const restOfAttrStr = attribute.attribute.slice(1);
                    const arg = translation ? translation.value : attribute.value;
                    const jsFn = `obj.set${firstLetter}${restOfAttrStr}('${arg}')`;

                    try {
                        eval(jsFn);
                    } catch (e) {
                        console.log(e);
                    }
                });
            }
        });
    }

    // new method for translations >= 24-LTS
    const translations = modelAppCacheTranslations.getData();
    if (typeof translations !== "undefined" && Object.keys(translations).length > 0) {
        Object.entries(translations).forEach(([fieldName, attributes]) => {
            const obj = sap.ui.getCore().byId(fieldName);
            if (obj) {
                Object.entries(attributes).forEach(([attributeName, translationMap]) => {
                    const translated = translationMap[language];
                    if (!!translated) {
                        switch (attributeName) {
                            case "text":
                                obj.setText(translated);
                                break;
                            case "intro":
                                obj.setIntro(translated);
                                break;
                            case "title":
                                obj.setTitle(translated);
                                break;
                            case "tooltip":
                                obj.setTooltip(translated);
                                break;
                            case "placeholder":
                                obj.setPlaceholder(translated);
                                break;
                            default:
                                appCacheError(
                                    `translation attribute function not set`,
                                    attributeName
                                );
                        }
                    }
                });
            }
        });
    }

    AppCache.coreLanguageHandler.updateResourceBundlesNewLang(language);
};

AppCache.waitForAppCacheLoad = function () {
    appCacheLog("AppCache.restrictedDisable: Before get data from database");

    return Promise.all([
        getCacheAppCacheUsers(true),
        getCacheAppCacheDiaSettings(true),
        getCacheAppCacheTiles(true),
        getCacheAppCacheCategory(true),
        getCacheAppCacheCategoryChild(true),
        getCacheAppCacheFavorites(true),
        getCacheAppCacheMostused(true),
        getCacheAppCacheCustomization(true),
        getCacheAppCacheTranslations(true),
    ]).catch((err) => {
        console.error("One or more AppCache loads failed", err);
    });
};

AppCache.initIDPProvider = function () {
    const { type: authType } = getAuthSettingsForUser();
    if (authType === "azure-bearer") {
        AppCacheLogonAzure.Init();
    } else if (authType === "openid-connect") {
        AppCacheLogonOIDC.Init();
    } else if (authType === "ldap") {
        AppCacheLogonLdap.Init();
    } else if (authType === "local") {
        AppCacheUserActionChangePassword.setVisible(!isChpassDisabled() && !isOffline());
        AppCacheLogonLocal.Init();
    }
};

AppCache.updateUserLoginTime = function () {
    let user = ModelData.FindFirst(AppCacheUsers, "username", AppCache.userInfo.username);
    if (user) {
        user.lastLogin = Date.now();
        ModelData.Update(AppCacheUsers, "username", AppCache.userInfo.username, user);
        setCacheAppCacheUsers();
    }
};

AppCache.restrictedDisable = async function () {

    if (AppCache.enablePasscode && !AppCache.isOffline) {
        const status = await AppCache.updateUserInfo();
        if (status === "Ok") {
            await AppCache.UpdateGetData();
            await AppCache.waitForAppCacheLoad();
            onAppCacheLoad();
        } else {
            appCacheError("User logged out due to error in updateUserInfo");
            AppCache.Lock();
        }
    } else {
        await AppCache.UpdateGetData();
        await AppCache.waitForAppCacheLoad();
        onAppCacheLoad();
    }

    AppCache.updateUserLoginTime();

    AppCache_boxLogon.setVisible(false);
    AppCacheUserActionSettings.setVisible(true);
    AppCache_boxPasscodeEntry.setVisible(false);
    AppCacheShellTitle.setVisible(false);
    AppCacheShellTitle.setText();
    sap.n.Launchpad.setSearchVisibility(true);

    if (!AppCache.StartApp && !AppCache.StartWebApp) AppCacheShellMenuOverflow.setVisible(true);
    
    launchpadContainer.addStyleClass("nepLaunchpadHorizontalMenu");

    // Config
    if (AppCache.config) {
        if (AppCache.config.hideTopHeader) topMenu.setHeight("0px");
        if (
            AppCache.config.verticalMenu &&
            sap.ui.Device.resize.width >= sap.n.Launchpad.verticalMenuLimit
        )
            sap.n.Launchpad.overflowMenuOpen();
    }

    AppCache.initIDPProvider();

    if (AppCache.enablePasscode) {
        AppCacheUserActionLock.setVisible(true);
        AppCacheUserActionSwitch.setVisible(false);
    } else {
        AppCacheUserActionLogout.setVisible(true);
    }

    function onAppCacheLoad() {
        AppCache.isRestricted = false;
        AppCache.Encrypted = "";

        appCacheLog("AppCache.restrictedDisable: All data fetched from database");
    
        sap.n.Launchpad.setAppWidthLimited(!AppCache.isFullWidth);

        // In offline mode, when BuildMenu is first called, cache is not loaded, causing an empty launchpad screen
        if (AppCache.isOffline) {
            sap.n.Launchpad.BuildMenu();
        }

        sap.n.Launchpad.RebuildTiles();

        // Enhancement
        if (sap.n.Enhancement.RestrictedDisable) {
            try {
                sap.n.Enhancement.RestrictedDisable();
            } catch (e) {
                appCacheError("Enhancement RestrictedDisable " + e);
            }
        }
    }
};

AppCache.AutoUpdateMobileApp = function () {
    // Update App - device check
    const deviceName = sap.ui.Device.os.name;
    if (!["win", "Android", "iOS"].includes(deviceName)) return;

    if (!isCordova()) return;
    if (AppCache.isOffline) return;

    // Version check
    const currentVersion = AppCache.AppVersion.replace(/\D/g, "");
    const activeVersion = AppCache.AppVersionActive.replace(/\D/g, "");

    if (currentVersion < activeVersion) {
        let n = `${AppCache.Url}/mobileClients/${AppCache.mobileClient}/build/${AppCache.AppVersionActiveID}/`;

        if (deviceName === "win") n += "Windows";
        else if (deviceName === "Android") n += "Android";
        else if (deviceName === "iOS") {
            n =
                "itms-services://?action=download-manifest&url=" +
                encodeURIComponent(`${n}Ios.plist`);
            console.log(n);
        }

        AppCache.UpdateMobileApp(n, AppCache.AppVersionActive);
    }
};

AppCache.fileWriter = {
    // Save the file to OS in blocks of 5MB recursively. Saving all in one block can result in out of memory errors on some devices
    writeBlock: function (fileWriter, bytesWritten, callback) {
        let blockSize = Math.min(5 * 1024 * 1024, AppCache.fileWriter.blob.size - bytesWritten);
        let block = this.blob.slice(
            bytesWritten,
            bytesWritten + blockSize,
            AppCache.fileWriter.blob.type
        );

        fileWriter.write(block);

        bytesWritten += blockSize;
        fileWriter.onwrite = function () {
            if (bytesWritten < AppCache.fileWriter.blob.size) {
                AppCache.fileWriter.writeBlock(fileWriter, bytesWritten, callback);
            } else {
                callback(fileWriter);
            }
        };
    }
};

AppCache.GetInstallationDir = async function () {
    return new Promise((resolve, reject) => {
        window.requestFileSystem(
            LocalFileSystem.TEMPORARY,
            0,
            function (fs) {
                resolve(fs.root.nativeURL);
            },
            reject
        );
    });
};

AppCache.DownloadFile = async function (url, filePath) {
    return new Promise((resolve, reject) => {
        const requestId = cordova.plugin.http.downloadFile(
            url,
            undefined,
            undefined,
            filePath,
            resolve,
            reject
        );
        AppCache.abortDownload = function () {
            cordova.plugin.http.abort(
                requestId,
                () => {},
                () => {}
            );
        };
    });
};

AppCache.OpenFile = async function (filePath, contentType) {
    return new Promise((resolve, reject) => {
        cordova.plugins.fileOpener2.open(filePath, contentType, {
            success: resolve,
            error: reject,
        });
    });
};

AppCache.UpdateMobileApp = async function (fileUrl, version) {
    // Update App - device check
    if (
        sap.ui.Device.os.name !== "iOS" &&
        sap.ui.Device.os.name !== "Android" &&
        sap.ui.Device.os.name !== "win"
    )
        return;

    sap.ui.core.BusyIndicator.hide();

    // iOS
    if (sap.ui.Device.os.name === "iOS") {
        window.open(fileUrl, "_system");
        return;
    }

    let fileDirectory = cordova.file.cacheDirectory;
    let localFile = AppCache.CurrentConfig;
    let remoteFile = fileUrl;
    let contentType;

    if (sap.ui.Device.os.name === "Android") {
        localFile += ".apk";
        contentType = "application/vnd.android.package-archive";
    } else {
        localFile += ".appx";
        contentType = "application/vns.ms-appx";
    }

    // Open Dialog
    AppCache_diaDownload.open();
    AppCache_diaDownload.setText(AppCache_tDownloading.getText() + " (v." + version + ")...");

    try {
        const filePath = (await AppCache.GetInstallationDir()) + localFile;
        await AppCache.DownloadFile(remoteFile, filePath);
        await AppCache.OpenFile(filePath, contentType);
        AppCache_diaDownload.close();
    } catch (error) {
        const message = error?.message || "Error installing new version";
        AppCache_diaDownload.setText(message);
        console.error(error);
    }
};

AppCache.clearCookies = function () {
    // Cookie Clearing - Android/iOS
    if (typeof cookieMaster !== "undefined") {
        cookieMaster.clearCookies(
            function () {},
            function () {}
        );
    }

    // Cookie Clearing - Windows 10
    try {
        document.execCommand("ClearAuthenticationCache", "false");
    } catch (e) {}

    // Enhancement
    if (sap.n.Enhancement.ClearCookies) {
        try {
            sap.n.Enhancement.ClearCookies();
        } catch (e) {
            appCacheError("Enhancement ClearCookies " + e);
        }
    }
};

// load initView in serial, otherwise multiple initView's loading the same AdaptiveApp might not work
//  since report is passed as 'this' reference from Adaptive List view
AppCache.isInitViewRunning = false;
AppCache._runInitViewSerially = () => {
    if (this.isInitViewRunning) {
        setTimeout(() => {
            this._runInitViewSerially();
        }, 10);
        return;
    }

    if (this.initViewQueue.length === 0) return;

    let { viewName, value, data, loadOptions } = this.initViewQueue[0];
    this.initViewQueue.splice(0, 1);
    this.initView({ viewName, value, data, loadOptions });
};

AppCache.createViewFor_1_56 = function ({ viewName, applid, value, loadOptions }) {
    if (!loadOptions.dialogShow && !loadOptions.parentObject) {
        try {
            const view = sap.ui.view({
                viewName: value.toUpperCase(),
                type: sap.ui.core.mvc.ViewType.JS,
            });

            if (loadOptions.appGUID) {
                AppCache.View[loadOptions.appGUID] = view;
            } else {
                AppCache.View[applid] = view;
            }
        } catch (err) {
            AppCache.handleTileError(err, loadOptions);
            AppCache.showTileErrorMessage(`Init view error in: ${value.toUpperCase()}`);
        }
    } else {
        try {
            AppCache.diaView = sap.ui.view({
                viewName: value.toUpperCase(),
                type: sap.ui.core.mvc.ViewType.JS,
            });
        } catch (err) {
            AppCache.handleTileError(err, loadOptions);
            AppCache.showTileErrorMessage(`Init view error in: ${value.toUpperCase()}`);
        }
    }

    AppCache.isInitViewRunning = false;
    AppCache.buildView({ viewName, applid, loadOptions });
};

AppCache.createView = function ({ viewName, applid, value, loadOptions }) {
    sap.ui.core.mvc.JSView.create({ viewName: value.toUpperCase() })
        .then(function (view) {
            if (!loadOptions.dialogShow && !loadOptions.parentObject) {
                if (loadOptions.appGUID) {
                    AppCache.View[loadOptions.appGUID] = view;
                } else {
                    AppCache.View[applid] = view;
                }
            } else {
                AppCache.diaView = view;
            }

            AppCache.buildView({ viewName, applid, loadOptions });
        })
        .catch(function (err) {
            AppCache.handleTileError(err, loadOptions);
            AppCache.showTileErrorMessage(err);
        })
        .finally(() => {
            AppCache.isInitViewRunning = false;
        });
};

AppCache.createNeptuneView = function ({ viewName, applid, value, loadOptions }) {
    try {
        const view = new neptune.Views[value.toUpperCase()];

        if (!loadOptions.dialogShow && !loadOptions.parentObject) {
            if (loadOptions.appGUID) {
                AppCache.View[loadOptions.appGUID] = view;
            } else {
                AppCache.View[applid] = view;
            }
        } else {
            AppCache.diaView = view;
        }

        AppCache.buildView({ viewName, applid, loadOptions });
    } catch (err) {
        AppCache.handleTileError(err, loadOptions);
        AppCache.showTileErrorMessage(err);
    } finally {
        AppCache.isInitViewRunning = false;
    }
};

AppCache.createViewMVC = function (ViewClass, { viewName, applid, value, loadOptions }) {
    try {
        // Using typed views in DXP24. View id will as a default be created based on the application name. That is very cool, but... __jsview is used all over the place in both Neptune and customer code to identify if a page is a view, so we set the UID token explicitely to jsview
        sap.ui.base.ManagedObject.getMetadata()._sUIDToken = "jsview";
        const viewPrefix = sap.ui.base.ManagedObject.getMetadata().uid();
        const view = new ViewClass({ viewName, id: viewPrefix });
        if (!loadOptions.dialogShow && !loadOptions.parentObject) {
            if (loadOptions.appGUID) {
                AppCache.View[loadOptions.appGUID] = view;
            } else {
                AppCache.View[applid] = view;
            }
        } else {
            AppCache.diaView = view;
        }

        AppCache.buildView({ viewName, applid, loadOptions });
    } catch (err) {
        AppCache.handleTileError(err, loadOptions);
        AppCache.showTileErrorMessage(err);
    } finally {
        AppCache.isInitViewRunning = false;
    }
};

AppCache.initView = function ({ viewName, value, data, loadOptions }) {
    // Load Option: Download
    if (loadOptions.load === "download") {
        sap.ui.core.BusyIndicator.hide();
        this._loadQueue();
        return;
    }

    if (this.isInitViewRunning) {
        this.initViewQueue.push({ viewName, value, data, loadOptions });
        this._runInitViewSerially();
        return;
    }

    this.isInitViewRunning = true;
    this.setGlobalAppGuidTo(loadOptions.appGUID);

    // Format ID
    let applid = value.replace(/\//g, "").toUpperCase();

    const isNeptuneView = data.indexOf("neptune.Views") > -1;
    const isSAPView = data.indexOf("return sap.ui.core.mvc.View.extend(") > -1;

    if (isNeptuneView) {
        try {
            if (!neptune.Views) neptune.Views = {};
            eval(data);
            this.createNeptuneView({ viewName, applid, value, loadOptions });
        } catch (err) {
            if (err.message) sap.m.MessageToast.show(err.message);
            this.isInitViewRunning = false;
        }
    } else if (isSAPView) {
        const ViewClass = (() => {
            try {
                return eval(`(() => {
                    ${data}
                })()`);
            } catch (err) {
                if (err.message) {
                    sap.m.MessageToast.show(err.message);
                }
                this.isInitViewRunning = false;
            }
        })();
        
        if (!ViewClass) {
            this.isInitViewRunning = false;
            return;
        }

        this.createViewMVC(ViewClass, { viewName, applid, value, loadOptions });
    } else {
        try {
            eval(data);
        } catch (error) {
            if (error.message) {
                sap.m.MessageToast.show(error.message);
            }
            this.isInitViewRunning = false;
            return;
        }

        // Creating UI5 view
        let versionParts = sap.ui.version.split(".");

        // BlockLayout vs Cards
        if (versionParts[0] >= 1 && versionParts[1] < 56) {
            this.createViewFor_1_56({ viewName, applid, value, loadOptions });
        } else {
            this.createView({ viewName, applid, value, loadOptions });
        }
    }
};

AppCache._builtViews = new Map(),

AppCache.buildView = function ({ viewName, applid, loadOptions }) {
    // Format Application ID
    let formattedAppId = applid.replace(/\//g, "");
    let tempView = sap.n.currentView;
    const { appGUID } = loadOptions;
    const eventId =
        typeof appGUID === "string" && appGUID.length > 0 ? appGUID : formattedAppId;

    if (!loadOptions.parentObject && !loadOptions.dialogShow) {
        sap.n.currentView = AppCache.View[eventId];
        this._builtViews.set(eventId, { viewName, applid, loadOptions });
    }

    // Turn off debug
    AppCacheShellDebug.setVisible(false);

    // Custom init
    if (sap.n.Apps[eventId]) {
        loadOptions.init = false;
        if (sap.n.Apps[eventId].init) {
            loadOptions.init = true;
            sap.n.Apps[eventId].init.forEach(function (initFunction) {
                if (loadOptions.startParams) {
                    try {
                        loadOptions.startParams = JSON.parse(loadOptions.startParams);
                    } catch (error) {}
                }

                initFunction(loadOptions.startParams, loadOptions);
            });
            sap.n.Apps[eventId].init = null;
        }

        // Custom beforeDisplay
        if (sap.n.Apps[eventId] && sap.n.Apps[eventId].beforeDisplay && !loadOptions.loadInBackground) {
            sap.n.Apps[eventId].beforeDisplay.forEach(function (beforeDisplayFunc) {
                if (loadOptions.startParams) {
                    try {
                        loadOptions.startParams = JSON.parse(loadOptions.startParams);
                    } catch (error) {}
                }

                beforeDisplayFunc(loadOptions.startParams, loadOptions);
            });
        }

        // Custom onNavigation
        if (sap.n.Apps[eventId] && sap.n.Apps[eventId].onNavigation && !loadOptions.loadInBackground) {
            sap.n.Apps[eventId].onNavigation.forEach(function (onNavigationFunc) {
                if (sap.n.HashNavigation.data)
                    sap.n.HashNavigation.data = JSON.parse(sap.n.HashNavigation.data);
                onNavigationFunc(sap.n.HashNavigation.data, loadOptions);
                sap.n.HashNavigation.data = "";
            });
        }
    }

    // Load Option: Not full load
    if (loadOptions.loadInBackground || (!!loadOptions.load && loadOptions.load !== "nav" && loadOptions.load !== "splitview")) {
        sap.n.currentView = tempView;
        sap.ui.core.BusyIndicator.hide();
        AppCache.saveChildView(tempView);
        AppCache.diaView = null;
        this._loadQueue();
        return;
    }

    // Dialog
    if (loadOptions.dialogShow) {
        let contHeight = loadOptions.dialogHeight;
        let contWidth = loadOptions.dialogWidth;

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
            resizable: true,
            draggable: true,
            stretchOnPhone: true,
            icon: loadOptions.dialogIcon,
            title: loadOptions.dialogTitle,
            hideMinimize: loadOptions.dialogHideMinimize,
            hideMosaic: loadOptions.dialogHideMosaic,
            hideMaximize: loadOptions.dialogHideMaximize,
            afterClose: function (oEvent) {
                // Delete From Array
                for (let i = 0; i < AppCache.Dialogs.length; i++) {
                    if (AppCache.Dialogs[i] === dia.getId()) {
                        AppCache.Dialogs.splice(i, 1);
                        break;
                    }
                }

                dia.destroyContent();
                dia = null;

                if (AppCache.Dialogs.length === 0) AppCacheShellDialog.setVisible(false);
            },
            beforeClose: loadOptions.onDialogClose,
        });

        // Add Dialog to Array
        AppCache.Dialogs.push(dia.getId());
        dia.addContent(AppCache.diaView);

        dia.open();
        sap.ui.core.BusyIndicator.hide();
        AppCache.saveChildView(AppCache.diaView);
        this._loadQueue();
        return;
    }

    // ParentObject
    if (loadOptions.parentObject) {
        let view = AppCache.diaView || AppCache.View[formattedAppId];

        if (loadOptions.parentObject.addContent) {
            loadOptions.parentObject.removeAllContent();
            loadOptions.parentObject.addContent(view);
            loadOptions.parentObject.rerender();

        } else if (loadOptions.parentObject.addItem) {
            loadOptions.parentObject.removeAllItems();
            loadOptions.parentObject.addItem(view);
            loadOptions.parentObject.rerender();
        }

        if (typeof loadOptions.parentObject.setBusy === "function")
            loadOptions.parentObject.setBusy(false);

        AppCache.diaView = null;
        AppCache.saveChildView(view);
        this._loadQueue();
        return;
    }

    // Add page to navigation
    if (!AppCacheNav.getPage(sap.n.currentView.sId)) AppCacheNav.addPage(sap.n.currentView);

    // Navigate
    AppCacheNav.to(sap.n.currentView, "show");

    // Set Shell Title
    if (sap.n.Launchpad.SetHeader) sap.n.Launchpad.SetHeader();

    // Set Shell Settings - Tiles
    let dataTile = ModelData.FindFirst(AppCacheTiles, "id", loadOptions.appGUID);

    if (dataTile) {
        let hideHeader = false;
        if (sap.n.Launchpad.isDesktop() && dataTile.hideHeaderL) hideHeader = true;
        if (sap.n.Launchpad.isTablet() && dataTile.hideHeaderM) hideHeader = true;
        if (sap.n.Launchpad.isPhone() && dataTile.hideHeaderS) hideHeader = true;
        sap.n.Launchpad.setHideHeader(hideHeader);

        if (dataTile.openFullscreen) {
            sap.n.Launchpad.setAppWidthLimited(false);
        } else {
            sap.n.Launchpad.setAppWidthLimited(true);
        }
    }

    sap.ui.core.BusyIndicator.hide();
    this._loadQueue();
};

AppCache.getView = function (value, loadOptions) {
    let url = "";
    const params = new URLSearchParams();

    // Get View from Server
    if (loadOptions.rootDir) {
        const { rootDir } = loadOptions;
        url = `${rootDir}${value}`;
        url += rootDir === "/views/" ? "" : ".js";
    } else {
        url = AppCache.isPublic ? `/public/app/${value}.js` : `/app/${value}.js`;
    }

    // Detect Mobile
    if (AppCache.isMobile) params.append("isMobile", "true");

    const headers = { "X-Requested-With": "XMLHttpRequest" };

    // Remote System
    if (loadOptions.appPath) {
        // Remote System
        if (loadOptions.appType === "SAP") {
            url = "/proxy/remote/";
            headers["NeptuneServer"] = loadOptions.appPath;

            // Add sap-language header, to load SAP apps with the same language as Open Edition
            headers["sap-language"] = getLaunchpadLanguage();

            const prefix = `${loadOptions.appPath}/neptune/`;
            if (loadOptions.sapICFNode) {
                url += encodeURIComponent(
                    prefix + loadOptions.sapICFNode + `/${value}.view.js`
                );
            } else {
                url += encodeURIComponent(prefix + `${value}.view.js`);
            }
            url += `/${loadOptions.appAuth}`;

            AppCache.hideGlobalAjaxError = true;
        } else {
            params.append("p9Server", loadOptions.appPath);

            const p = encodeURIComponent(loadOptions.appPath + url);
            if (loadOptions.appAuth) url = `/proxy/remote/${p}/${loadOptions.appAuth}`;
            else url = `/proxy/${p}`;
        }

        // Remote System ID for adding  proxy authentication
        if (loadOptions.appAuth) headers["X-Auth-In-P9"] = loadOptions.appAuth;
    }

    url = AppCache.Url + url;

    params.append("view", "true");
    params.append("lang", getLaunchpadLanguage());

    const winParams = new URLSearchParams(window.location.search);
    if (winParams.has("debug")) params.append("debug", true);

    // Enhancement
    if (sap.n.Enhancement.RemoteSystemAuth) {
        try {
            sap.n.Enhancement.RemoteSystemAuth(headers);
        } catch (e) {
            appCacheError("Enhancement RemoteSystemAuth " + e);
        }
    }

    if (params.size > 0) url += `?${params.toString()}`;

    request({
        datatype: "HTML",
        type: "GET",
        url,
        headers,
        success: function (data, status, request) {
            AppCache.hideGlobalAjaxError = true;

            // Save in DB/LocalStorage
            const viewName = getAppViewName(value, loadOptions.appPath);
            saveView(viewName, data);

            // Set App Initialized
            AppCache.Initialized = true;
            AppCache.isOffline = isOffline();

            // Update Application Data
            if (value !== "cockpit_doc_reader") {
                // App Timestamp in Header
                let updatedAt = request.getResponseHeader("X-Updated-At");
                if (loadOptions.appType !== "SAP") updatedAt = parseFloat(updatedAt);

                // Get TimeStamp from App
                if (updatedAt) {
                    ModelData.Update(
                        AppCacheData,
                        ["application", "language", "appPath"],
                        [value.toUpperCase(), getLaunchpadLanguage(), loadOptions.appPath],
                        {
                            appType: "app",
                            application: value.toUpperCase(),
                            updatedAt: updatedAt,
                            invalid: false,
                            language: getLaunchpadLanguage(),
                            appPath: loadOptions.appPath,
                        }
                    );

                    setCacheAppCacheData();
                } else {
                    let url = "/api/functions/Launchpad/GetAppTimestamp";
                    let headers = {};

                    // Remote System
                    if (loadOptions.appPath) {
                        url =
                            "/proxy/remote/" +
                            encodeURIComponent(loadOptions.appPath + url) +
                            "/" +
                            loadOptions.appAuth;
                    }

                    url = AppCache.Url + url;

                    // Enhancement
                    if (sap.n.Enhancement.RemoteSystemAuth) {
                        try {
                            sap.n.Enhancement.RemoteSystemAuth(headers);
                        } catch (e) {
                            appCacheError("Enhancement RemoteSystemAuth " + e);
                        }
                    }

                    // Get App Timestamp
                    jsonRequest({
                        url,
                        headers,
                        data: JSON.stringify({ application: value }),
                        success: function (data) {
                            ModelData.Update(
                                AppCacheData,
                                ["application", "language", "appPath"],
                                [
                                    value.toUpperCase(),
                                    getLaunchpadLanguage(),
                                    loadOptions.appPath,
                                ],
                                {
                                    appType: "app",
                                    application: value.toUpperCase(),
                                    updatedAt: data.updatedAt,
                                    invalid: false,
                                    language: getLaunchpadLanguage(),
                                    appPath: loadOptions.appPath,
                                }
                            );
                            setCacheAppCacheData();
                        },
                        error: function (result, status) {},
                    });
                }
            }

            // Start View
            AppCache.initView({ viewName, value, data, loadOptions });
        },
        error: function (err) {
            if (err.status === 401) {
                diaSessionTimeout.open();
                return;
            }

            if (err.status === 404) {
                Array.isArray(modelAppCacheTiles.oData) &&
                    modelAppCacheTiles.oData.forEach(function (tile) {
                        if (
                            tile &&
                            (tile.actionApplication === value || tile.tileApplication === value)
                        ) {
                            let b = sap.ui.getCore().byId(`but${tile.id}`);
                            if (b) b.destroy();
                        }
                    });
                AppCache.showTileErrorMessage(AppCache_tAppNotFound.getText());
            }

            AppCache.handleTileError(err.statusText, loadOptions);
            setTimeout(function () {
                AppCache.hideGlobalAjaxError = false;
            }, 100);
        },
    });
};

AppCache.handleTileError = function (err, loadOptions) {
    sap.n.currentView = "";
    sap.n.Shell.closeTile({ id: loadOptions.appGUID });
    sap.n.Shell.closeSidepanel();

    if (AppCacheNav.getCurrentPage().getContent().length === 0) {
        sap.n.Launchpad.reCreateCurrentPage();
    }

    if (err) console.log(err);
};

AppCache.showTileErrorMessage = function (err) {
    const msg = err.toString();
    if (diaTileError.isOpen()) {
        const existing = diaTileErrorContent.getText();
        if (!existing.includes(msg)) {
            diaTileErrorContent.setText(`${existing}\n${msg}`);
        }
        return;
    }

    diaTileErrorContent.setText(msg);
    diaTileError.open();
};

AppCache.getWebApp = function (dataTile, dataCat) {
    if (AppCache.isPublic) url = "/public/webapp/" + dataTile.actionWebApp;
    else url = "/webapp/" + dataTile.actionWebApp;

    // Detect Mobile
    if (AppCache.isMobile) url += "?isMobile=true";

    let headers = { "X-Requested-With": "XMLHttpRequest" };

    if (dataTile.urlApplication) {
        if (AppCache.userInfo.azureToken)
            headers.Authorization = "Bearer " + AppCache.userInfo.azureToken.id_token;
        url =
            AppCache.Url +
            "/proxy/remote/" +
            encodeURIComponent(dataTile.urlApplication + url) +
            "/" +
            dataTile.urlAuth;
    } else {
        url = AppCache.Url + url;
    }

    // Enhancement
    if (sap.n.Enhancement.RemoteSystemAuth) {
        try {
            sap.n.Enhancement.RemoteSystemAuth(headers);
        } catch (e) {
            appCacheError("Enhancement RemoteSystemAuth " + e);
        }
    }

    request({
        datatype: "HTML",
        type: "GET",
        url: url,
        headers: headers,
        success: function (data) {
            // Save in DB/LocalStorage
            const viewName = getWebAppViewName(dataTile.actionWebApp, dataTile.urlApplication);
            saveView(viewName, data);

            let url = "/api/functions/Launchpad/GetAppTimestamp";
            let headers = {};

            // Remote System
            if (dataTile.urlApplication) {
                if (AppCache.userInfo.azureToken)
                    headers.Authorization = "Bearer " + AppCache.userInfo.azureToken.id_token;
                url =
                    "/proxy/remote/" +
                    encodeURIComponent(dataTile.urlApplication + url) +
                    "/" +
                    dataTile.urlAuth;
            }

            url = AppCache.Url + url;

            // Enhancement
            if (sap.n.Enhancement.RemoteSystemAuth) {
                try {
                    sap.n.Enhancement.RemoteSystemAuth(headers);
                } catch (e) {
                    appCacheError("Enhancement RemoteSystemAuth " + e);
                }
            }

            // Get App Timestamp
            jsonRequest({
                type: "POST",
                contentType: "application/json",
                url: url,
                headers: headers,
                data: JSON.stringify({ webapp: dataTile.actionWebApp }),
                success: function (data) {
                    ModelData.Update(
                        AppCacheData,
                        ["application", "appPath"],
                        [data.application, dataTile.urlApplication],
                        {
                            appType: "webapp",
                            application: data.application,
                            appPath: dataTile.urlApplication,
                            updatedAt: data.updatedAt,
                            invalid: false,
                            language: getLaunchpadLanguage(),
                        }
                    );
                    setCacheAppCacheData();
                },
                error: function (result, status) {},
            });

            // Set Flag to InMemory
            AppCache.View[viewName] = true;

            // Start View
            AppCache.buildWebApp(dataTile, data, dataCat);
        },
        error: function (error) {
            if (error.status === 404) {
                Array.isArray(modelAppCacheTiles.oData) &&
                    modelAppCacheTiles.oData.forEach(function (tile) {
                        if (tile && tile.actionWebApp === dataTile.actionWebApp) {
                            let b = sap.ui.getCore().byId(`but${tile.id}`);
                            if (b) b.destroy();
                        }
                    });
                AppCache.showTileErrorMessage(AppCache_tAppNotFound.getText());
            }

            AppCache.handleTileError(error.statusText, loadOptions);
        },
    });
};

AppCache.buildWebApp = function (dataTile, viewData, dataCat) {
    // As Dialog
    if (dataTile.openDialog) {
        sap.n.Launchpad.contextType = "Tile";
        sap.n.Launchpad.contextTile = dataTile;

        sap.n.Shell.openUrl(dataTile.actionWebApp, {
            webAppData: viewData,
            dialogTitle: dataTile.title,
            dialogWidth: dataTile.dialogWidth || "1200px",
            dialogHeight: dataTile.dialogHeight || "90%",
        });

        location.hash = "";
        AppCacheBackButton.setVisible(false);
        return;
    }

    if (dataTile.actionWebApp !== AppCache.StartWebApp) {
        sap.n.Launchpad.handleNavButton({
            dataTile: dataTile,
            dataCat: dataCat
        });
    }
    AppCacheNav.to(AppCache_boxURL, "show");

    // As Embedded
    sap.n.Launchpad.setAppWidthLimited(!dataTile.openFullscreen);

    // Hide All
    hideChildren("#AppCache_URLDiv");

    // Check If element exist > Display or Create
    const el = elById(`iFrame${dataTile.id}`);
    if (el) {
        el.style.display = "block";
        return;
    }

    const { actionWebApp: webAppName } = dataTile;
    const url = `${AppCache.Url}/webapp/${webAppName}?isMobile=true`;
    appendIFrame(querySelector("#AppCache_URLDiv"), {
        id: `iFrame${dataTile.id}`,
        frameborder: "0",
        style: "border: 0;",
        width: "100%",
        height: "100%",
        src: url,
    });
};

AppCache.userLogout = function(user) {

    ModelData.Delete(AppCacheUsers, 'username', user);
    setCacheAppCacheUsers();

    // Remove iOS SAMKeychain library and Android SecureStorage key
    if (typeof window.cordova !== 'undefined' && !window.navigator.simulator && data.biometric) {

        if (sap.ui.Device.os.ios || sap.ui.Device.os.android) {

            // Set iOS SAMKeychain library and Android SecureStorage key
            let servicekey = user.toString().toUpperCase();

            // Delete SecureStorage key
            if (typeof cordova.plugins !== 'undefined' && cordova.plugins.SecureStorage) {
                let ss = new cordova.plugins.SecureStorage(
                    function () {
                        try {
                            ss.remove(function (key) { }, function (error) { }, servicekey);
                        } catch (error) { }
                    },
                    function (error) { },
                    AppCache.AppID);
            }

            // FingerprintAuth.delete
            if (window.FingerprintAuth) {
                try {
                    FingerprintAuth.delete({
                        clientId: AppCache.AppID,
                        username: servicekey
                    }, function (result) {

                    }, function (error) {

                    });
                } catch (error) {

                }
            }
        }
    }

    toolUsersFilter.setValue();
    toolUsersFilter.fireLiveChange();
    AppCache.calculateUserScreen();

    // No User -> Logon Screen
    if (!modelAppCacheUsers.oData.length) AppCache.setEnableLogonScreen();
};

AppCache.Lock = function () {
    
    AppCache_boxLogon.setVisible(true);

    const { type: authType } = getAuthSettingsForUser();

    // Enhancement
    if (sap.n.Enhancement.BeforeLock) {
        try {
            sap.n.Enhancement.BeforeLock(authType);
        } catch (e) {
            appCacheError(`Enhancement BeforeLock ${e}`);
        }
    }

    AutoLockTimer.stop();
    setTimeout(() => {
        sap.n.Layout.setHeaderPadding();
    }, 100);

    if (authType === "azure-bearer") {
        AppCacheLogonAzure.Logout();
    } else if (authType === "openid-connect") {
        AppCacheLogonOIDC.Logout();
    } else if (authType === "ldap") {
        AppCacheLogonLdap.Logout();
    } else if (authType === "local") {
        AppCacheLogonLocal.Logout();
    }

    AppCache.restrictedEnable();

    // Check PIN Code
    if (!AppCache.enablePasscode) {
        AppCache.Logout();
        return;
    }

    AppCache.translate(getLaunchpadLanguage());

    // Clear NumPad
    NumPad.attempts = 0;
    NumPad.numValue = "";
    NumPad.Verify = false;

    destroyTopAndSidebarOpenAppButtons();

    if (Array.isArray(modelAppCacheUsers.oData) && modelAppCacheUsers.oData.length > 1) {
        AppCache.setEnableUsersScreen();
    } else {
        AppCache.setEnablePasscodeEntry();
    }

    sap.ui.core.BusyIndicator.hide();
};

AppCache.Logout = function () {
    AppCache_boxLogon.setVisible(true);

    const { type: authType } = getAuthSettingsForUser();

    // Enhancement
    if (sap.n.Enhancement.BeforeLogout) {
        try {
            sap.n.Enhancement.BeforeLogout(authType);
        } catch (e) {
            appCacheError("Enhancement BeforeLogout " + e);
        }
    }

    AutoLockTimer.stop();
    removeLaunchpadFromCache();
    destroyTopAndSidebarOpenAppButtons();

    if (AppCache.isMobile) {
        // Restricted Area
        AppCache.restrictedEnable();

        // Show Logon Screen
        AppCache.setEnableLogonScreen();
        AppCache.Initialized = false;
        NumPad.attempts = 0;
        NumPad.numValue = "";
        AppCache.Encrypted = "";
        AppCache_inUsername.setValue();
        AppCache_inPassword.setValue();
        AppCacheShellUserName.setText();
        AppCacheShellUserName.setVisible(false);

        if (AppCache.enableAutoLogin) AppCacheLogonLocal.AutoLoginRemove();

        if (isExternalLogoutEnabled()) {
            if (authType === "azure-bearer") {
                AppCacheLogonAzure.Logout();
            } else if (authType === "openid-connect") {
                AppCacheLogonOIDC.Logout();
            } else if (authType === "ldap") {
                AppCacheLogonLdap.Logout();
            } else {
                AppCacheLogonLocal.Logout();
            }
        } else {
            AppCacheLogonLocal.Logout();
        }
    } else {
        if (isExternalLogoutEnabled()) {
            if (authType === "azure-bearer") {
                AppCacheLogonAzure.Logout();
            } else if (authType === "openid-connect") {
                AppCacheLogonOIDC.Logout();
            } else if (authType === "saml") {
                AppCacheLogonSaml.Logout();
            } else if (authType === "ldap") {
                AppCacheLogonLdap.Logout();
            } else {
                AppCacheLogonLocal.Logout();
            }
        } else {
            AppCacheLogonLocal.Logout();
        }
    }

    if (sap.n.Enhancement.AfterLogout) {
        try {
            sap.n.Enhancement.AfterLogout(authType);
        } catch (e) {
            appCacheError("Enhancement AfterLogout " + e);
        }
    }

    AppCache.translate(getLaunchpadLanguage());
    sap.ui.core.BusyIndicator.hide();
};

AppCache.LogonCustom = function (options) {
    AppCache_loginTypes.setSelectedKey(options.logonid);
    AppCache_inUsername.setValue(options.username);
    AppCache_inPassword.setValue(options.password);
    AppCache.Logon();
};

AppCache.Logon = function () {
    const settings = getAuthSettingsForUser();
    const { type: authType } = settings;

    if (authType !== "local") AppCacheLogonLocal.AutoLoginRemove();

    if (authType === "local") AppCacheLogonLocal.Logon();
    else if (authType === "sap") AppCacheLogonSap.Logon();
    else if (authType === "azure-bearer") AppCacheLogonAzure.Logon();
    else if (authType === "openid-connect") AppCacheLogonOIDC.Logon();
    else if (authType === "ldap") AppCacheLogonLdap.Logon();
    else if (authType === "saml") {
        if (AppCache.isMobile) {
            AppCacheLogonSaml.Logon(settings);
        } else {
            window.open(settings.entryPoint);
        }
    }
};

AppCache.setUserInfo = function () {
    sap.n.Shell.setUserText(AppCache.userInfo.name || AppCache.userInfo.username);
    AppCacheShellUserName.setVisible(!!AppCacheShellUserName.getText());

    const langQueryParam = isLanguageSetInQueryParam();
    if (!langQueryParam.exists) {
        let language = getLaunchpadLanguage();
        if (language instanceof Promise) {
            // skipping this exceptional case for language being returned as a Promise type
        } else if (!sap.n.Launchpad.isLanguageValid(language)) {
            language = sap.n.Launchpad.isLanguageValid(AppCache.userInfo.language)
                ? AppCache.userInfo.language
                : "EN";

            setLaunchpadLanguage(language);
            inAppCacheFormSettingsLang.setSelectedKey(language);
            sap.n.Launchpad.setUserLanguage(language);
        } else {
            const { languages } = AppCache.config;
            if (Array.isArray(languages) && !languages.includes(language)) {
                if (languages.includes(AppCache.userInfo.language)) {
                    language = AppCache.userInfo.language;
                } else {
                    language = "EN";
                }

                setLaunchpadLanguage(language);
                inAppCacheFormSettingsLang.setSelectedKey(language);
                sap.n.Launchpad.setUserLanguage(language);
            } else {
                inAppCacheFormSettingsLang.setSelectedKey(langQueryParam.language);
            }
        }
    }

    // Enhancement
    if (sap.n.Enhancement.setUserInfo) {
        try {
            sap.n.Enhancement.setUserInfo();
        } catch (e) {
            appCacheError("Enhancement setUserInfo " + e);
        }
    }

    if (AppCache.isMobile) return;

    const { type: authType } = getAuthSettingsForUser();
    if (authType === "azure-bearer") {
        let tokenData = localStorage.getItem("p9azuretoken");
        let tokenDatav2 = localStorage.getItem("p9azuretokenv2");

        if (tokenData || tokenDatav2) {
            try {
                if (tokenDatav2) {
                    AppCacheLogonAzure.Relog(null);
                } else {
                    AppCache.userInfo.azureToken = JSON.parse(tokenData);
                    AppCache.userInfo.azureUser = parseJsonWebToken(
                        AppCache.userInfo.azureToken.id_token
                    );
                    AppCache.userInfo.authDecrypted =
                        AppCache.userInfo.azureToken.refresh_token;

                    if (AppCache.userInfo.azureToken.refresh_token) {
                        AppCacheLogonAzure.Relog(AppCache.userInfo.azureToken.refresh_token);
                    }
                }
            } catch (e) {}
        }
    } else if (authType === "openid-connect") {
        let tokenDataOIDC = localStorage.getItem("p9oidctoken");
        if (tokenDataOIDC) {
            try {
                AppCache.userInfo.oidcToken = JSON.parse(tokenData);
                AppCache.userInfo.oidcUser = parseJsonWebToken(
                    AppCache.userInfo.azureToken.id_token
                );
                AppCache.userInfo.authDecrypted = AppCache.userInfo.oidcToken.refresh_token;
            } catch (e) {}
        }
    }
};

AppCache.getUserInfo = function () {
    fetchUserInfo(
        function (data) {
            appCacheLog("Successfully received User Info from P9");
            appCacheLog(data);
            AppCache.afterUserInfo(false, data);
            AppCache_boxLogon.setVisible(false);
        },
        function (result, error) {
            appCacheError("Error getting User Info (getUserInfo)");

            // Cookie Disabled ?
            if (result.status === 401) {
                console.error(
                    "getUserInfo: 401 Not authenticated. Please check system settings and security for cookie settings"
                );
            }
            AppCache.afterUserInfo(true);
        }
    );
    sap.n.Launchpad.setPersonalization();
};

AppCache.updateUserInfo = function () {
    return new Promise(function (resolve) {
        appCacheLog("AppCache.updateUserInfo: Starting");

        fetchUserInfo(
            function (userInfo) {
                appCacheLog("AppCache.updateUserInfo: Successfully received User Info from P9");
                appCacheLog(userInfo);

                if (userInfo && userInfo.length) {
                    let u = userInfo[0];
                    let user = ModelData.FindFirst(AppCacheUsers, "username", u.username);

                    if (user) {
                        user = Object.assign({}, user, {
                            group: u.group || [],
                            roles: u.roles || [],
                            language: u.language,
                            mobile: u.mobile,
                            phone: u.phone,
                            email: u.email,
                            name: u.name,
                        });

                        sap.n.Shell.setUserText(user.name || user.username);
                        AppCacheShellUserName.setVisible(!!AppCacheShellUserName.getText());
                        ModelData.Update(AppCacheUsers, "username", user.username, user);
                        setCacheAppCacheUsers();
                    }
                }
                resolve("Ok");
            },
            function (result, _err) {
                appCacheError("Error getting User Info from (updateUserInfo)");
                appCacheError(result);
                resolve("Error");
            }
        );
    });
};

AppCache.afterSetUserInfo = function () {
    if (refreshingAuth) {
        setTimeout(() => {
            this.afterSetUserInfo();
        }, AppCache.DelayOnRefreshingToken.SetUserInfo);
        return;
    }

    const userData = AppCache.userInfo;

    // Azure/OIDC - No PIN Code
    if (!AppCache.enablePasscode) {
        if (AppCache.userInfo) {
            if (AppCache.userInfo.azureToken)
                userData.azureToken = AppCache.userInfo.azureToken;
            if (AppCache.userInfo.azureUser) userData.azureUser = AppCache.userInfo.azureUser;
            if (AppCache.userInfo.oidcToken) userData.oidcToken = AppCache.userInfo.oidcToken;
            if (AppCache.userInfo.oidcUser) userData.oidcUser = AppCache.userInfo.oidcUser;
        }

        if (isPWAEnabled()) {
            const { type: authType } = getAuthSettingsForUser();
            if (authType === "azure-bearer") AppCacheLogonAzure.Logout();
            if (authType === "openid-connect") AppCacheLogonOIDC.Logout();
        }
    }

    // Set Layout
    getCacheAppCacheDiaSettings(true);

    // Desktop
    if (!AppCache.isMobile) {
        if (!isLanguageSetInQueryParam().exists) {
            AppCache.translate(getLaunchpadLanguage());
        }

        Promise.all([
            getCacheAppCacheUsers(true),
            getCacheAppCacheDiaSettings(true),
            getCacheAppCacheTiles(true),
            getCacheAppCacheCategory(true),
            getCacheAppCacheCategoryChild(true),
            getCacheAppCacheFavorites(true),
            getCacheAppCacheMostused(true),
            getCacheAppCacheCustomization(true),
            getCacheAppCacheTranslations(true)
        ]).then(()=>{
            AppCache.Update();
        }).catch((err) => {
            console.error("One or more AppCache loads failed", err);
        });

    } else {
        // Translate if Mobile and not PIN Code
        if (!AppCache.enablePasscode) {
            AppCache.translate(getLaunchpadLanguage());
        }

        if (AppCache.enablePasscode) {
            NumPad.Verify = true;
            AppCache.setEnablePasscodeScreen();
        } else {
            NumPad.Verify = true;
            AppCacheShellUser.setEnabled(true);
            AppCacheUserActionLogout.setVisible(true);
            if (AppCache.biometricAuthentication) sap.n.Fingerprint.saveBasicAuth();
            AppCache.Update();
        }
    }

    // if pincode is disabled but Autolock is enabled
    if (!AppCache.enablePasscode) {
        AutoLockTimer.start();
    }
};

AppCache.afterUserInfo = function (offline, data) {
    let userData = {};
    if (offline && !AppCache.isMobile) {
        getCacheAppCacheUsers();
        userData = modelAppCacheUsers.oData[0];
    } else if (data) {
        userData = data[0];
        userData.logonData = getAuthSettingsFromLoginType(); // setting authentication settings on user object
        ModelData.Update(AppCacheUsers, "username", data[0].username, userData);
        setCacheAppCacheUsers();
    }

    sap.ui.core.BusyIndicator.hide();
    AppCache_inPassword.setValue();

    if (AppCache.loginApp) sap.n.Launchpad.setAppWidthLimited(true);

    // User Information
    if (userData) AppCache.userInfo = userData;
    AppCache.setUserInfo();

    // show/hide change password in user menu
    const { type: authType } = userData.logonData;
    AppCacheUserActionChangePassword.setVisible(
        authType === "local" && !isChpassDisabled() && !isOffline()
    );

    this.afterSetUserInfo();
};

AppCache.clearPasscodeInputs = function () {
    const p1 = AppCache_inPasscode1;
    const p2 = AppCache_inPasscode2;

    p1.setValue().setValueState("None");
    p2.setValue().setValueState("None");
};

AppCache.SetPasscode = function () {
    if (userIsNotLoggedIn()) return;

    const p1 = AppCache_inPasscode1;
    const p2 = AppCache_inPasscode2;

    const v1 = p1.getValue().trim();
    const v2 = p2.getValue().trim();

    const v1Valid = isPincodeValid(v1);
    const v2Valid = isPincodeValid(v2);

    if (!v1Valid.isValid && v1Valid.errorMessage) {
        showPincodeError(v1Valid.errorMessage);
        AppCache.clearPasscodeInputs();
        return p1.focus();
    }

    if (!v2Valid.isValid && v2Valid.errorMessage) {
        showPincodeError(v2Valid.errorMessage);
        AppCache.clearPasscodeInputs();
        return p2.focus();
    }

    if (!v1) {
        showPincodeError(pincodeEntryErrs().newPasscode, p1);
        return p1.focus();
    }

    if (!v2) {
        showPincodeError(pincodeEntryErrs().repeatPasscode, p2);
        return p2.focus();
    }

    if (v2.length !== AppCache.passcodeLength) {
        showPincodeError(pincodeEntryErrs().passcodeTooShort);
        AppCache.clearPasscodeInputs();
        return p1.focus();
    }

    if (v1 !== v2) {
        showPincodeError(pincodeEntryErrs().passcodeNoMatch);
        AppCache.clearPasscodeInputs();
        return p1.focus();
    }

    // Clear Values
    AppCache.Passcode = p1.getValue();
    setTimeout(AppCache.clearPasscodeInputs, 1000);

    // Store Authentication
    const key = generatePBKDF2Key(AppCache.Passcode, AppCache.deviceID);
    const encrypted = encryptAES(AppCache.Auth, key.toString());
    AppCache.Encrypted = encrypted.toString();

    // User Data
    if (
        isCordova() &&
        typeof cordova.plugins !== "undefined" &&
        typeof cordova.plugins.SecureKeyStore !== "undefined"
    ) {
        let sksKey = AppCache.AppID + "-" + AppCache.userInfo.username;
        cordova.plugins.SecureKeyStore.set(
            function (res) {},
            function (error) {
                // The SecureKeyStore plugin still creates an entry, even on error, so we remove it.
                cordova.plugins.SecureKeyStore.remove(
                    (successMessage) => {},
                    (error) => {},
                    sksKey
                );

                AppCache.userInfo.auth = encrypted.toString();
            },
            sksKey,
            encrypted.toString()
        );
    } else {
        AppCache.userInfo.auth = encrypted.toString();
    }

    // Store data to user
    if (isCordova() && !window.navigator.simulator && AppCache.biometricAuthentication)
        AppCache.userInfo.biometric = true;

    // Only Biometric for 1. User
    if (modelAppCacheUsers.oData.length > 1) AppCache.userInfo.biometric = false;
    if (
        modelAppCacheUsers.oData.length === 1 &&
        modelAppCacheUsers.oData[0].username !== AppCache.userInfo.username
    )
        AppCache.userInfo.biometric = false;

    // Save User Data
    setCacheAppCacheUsers();
    modelAppCacheUsers.refresh();

    const { type: authType } = getAuthSettingsForUser();
    if (isPWAEnabled()) {
        if (authType === 'azure-bearer') {
            AppCacheLogonAzure.Logout();
        } else if (authType === 'openid-connect') {
            AppCacheLogonOIDC.Logout();
        }
    }

    // Store passcode to OS SAMKeychain library or Android SecureStorage
    if (isCordova() && !window.navigator.simulator && AppCache.biometricAuthentication) {
        // Set OS SAMKeychain library and Android SecureStorage key
        let serviceKey = AppCache.userInfo.username;
        let dialogText = AppCache_tEnableFingerprint.getText();

        if (
            sap.ui.Device.os.ios &&
            sap.ui.Device.os.version >= 11 &&
            device &&
            device.model &&
            device.model.indexOf("iPhone10") > 0
        ) {
            dialogText = AppCache_tEnableFaceId.getText();
        }

        if (sap.ui.Device.os.android && FingerprintAuth) {
            try {
                FingerprintAuth.isAvailable(
                    function (result) {
                        if (result.isAvailable && result.hasEnrolledFingerprints) {
                            // Prevent soft keyboard
                            p1.setEnabled(false);
                            p2.setEnabled(false);

                            // Get user language
                            let pluginLanguage = sap.n.Fingerprint.android.getLanguage(
                                getLaunchpadLanguage()
                            );

                            // Biometric authentication config
                            let encryptConfig = {
                                clientId: AppCache.AppID,
                                username: serviceKey,
                                password: AppCache.Passcode,
                                disableBackup: true,
                                maxAttempts: 5,
                                locale: pluginLanguage,
                                userAuthRequired: true,
                                dialogMessage: dialogText,
                            };

                            // Encrypt
                            FingerprintAuth.encrypt(
                                encryptConfig,
                                function (result) {
                                    // Encryption success
                                    if (result.withFingerprint || result.withBackup) {
                                        AppCache.userInfo.token = result.token;
                                        setCacheAppCacheUsers();
                                        AppCache.setEnablePasscodeEntry();
                                    } else {
                                        AppCache.biometricAuthentication = false;
                                        AppCache.userInfo.biometric = false;
                                        setCacheAppCacheUsers();
                                        AppCache.setEnablePasscodeEntry();
                                    }
                                },
                                function (error) {
                                    AppCache.biometricAuthentication = false;
                                    AppCache.userInfo.biometric = false;
                                    setCacheAppCacheUsers();
                                    AppCache.setEnablePasscodeEntry();
                                }
                            );
                        } else {
                            AppCache.biometricAuthentication = false;
                            AppCache.userInfo.biometric = false;
                            setCacheAppCacheUsers();
                            AppCache.setEnablePasscodeEntry();
                        }
                    },
                    function (error) {
                        AppCache.biometricAuthentication = false;
                        AppCache.userInfo.biometric = false;
                        setCacheAppCacheUsers();
                        AppCache.setEnablePasscodeEntry();
                    }
                );
            } catch (error) {
                AppCache.biometricAuthentication = false;
                AppCache.userInfo.biometric = false;
                setCacheAppCacheUsers();
                AppCache.setEnablePasscodeEntry();
            }
        } else if (
            sap.ui.Device.os.ios &&
            typeof cordova.plugins !== "undefined" &&
            cordova.plugins.SecureKeyStore &&
            typeof CID !== "undefined"
        ) {
            // Prevent soft keyboard
            p1.setEnabled(false);
            p2.setEnabled(false);

            CID.checkAuth(
                dialogText,
                function (res) {
                    if (res == "success") {
                        cordova.plugins.SecureKeyStore.set(
                            function (res) {
                                AppCache.setEnablePasscodeEntry();
                            },
                            function (error) {
                                console.log(error);
                                AppCache.biometricAuthentication = false;
                                AppCache.userInfo.biometric = false;
                                setCacheAppCacheUsers();
                                AppCache.setEnablePasscodeEntry();
                            },
                            serviceKey,
                            AppCache.Passcode
                        );
                    } else {
                        console.log(res);
                        AppCache.biometricAuthentication = false;
                        AppCache.userInfo.biometric = false;
                        setCacheAppCacheUsers();
                        AppCache.setEnablePasscodeEntry();
                    }
                },
                function (error) {
                    console.log(error);
                    AppCache.biometricAuthentication = false;
                    AppCache.userInfo.biometric = false;
                    setCacheAppCacheUsers();
                    AppCache.setEnablePasscodeEntry();
                }
            );
        } else {
            AppCache.biometricAuthentication = false;
            AppCache.userInfo.biometric = false;
            setCacheAppCacheUsers();
            AppCache.setEnablePasscodeEntry();
        }
    } else {
        AppCache.setEnablePasscodeEntry();
    }
};

AppCache.RemoveAllCache = function () {
    appCacheLog("AppCache.RemoveAllCache triggered");

    // Remove iOS SAMKeychain library and Android SecureStorage keys
    if (isCordova() && !window.navigator.simulator) {
        if (sap.ui.Device.os.ios || sap.ui.Device.os.android) {
            // KeyChain & SecureStorage
            if (
                isSecureKeyStorePluginAvailableOnCordova() &&
                Array.isArray(modelAppCacheUsers.oData)
            ) {
                const users = modelAppCacheUsers.getData();
                users.forEach((user) => {
                    const key = `${AppCache.AppID}-${user.username}`;
                    cordova.plugins.SecureKeyStore.remove(
                        function (res) {
                            appCacheLog(`${key} removed successfully`, res);
                        },
                        function (error) {
                            appCacheError(`unable to remove key ${key}`, error);
                        },
                        key
                    );
                });
            }

            let serviceKey;

            // FingerprintAuth.delete
            if (window.FingerprintAuth) {
                modelAppCacheUsers.oData.forEach(function (data) {
                    if (!data.biometric) return true;
                    serviceKey = data.username;
                    try {
                        FingerprintAuth.delete(
                            {
                                clientId: AppCache.AppID,
                                username: serviceKey,
                            },
                            function (result) {},
                            function (error) {
                                console.error(error);
                            }
                        );
                    } catch (error) {
                        console.error(error);
                    }
                });
            }
        }
    }

    // LocalStorage
    localStorage.clear();

    // IndexedDB
    p9ClearViews();
    p9ClearModels();

    [
        modelAppCacheUsers,
        modelAppCacheData,
        modelAppCacheTiles,
        modelAppCacheCategory,
        modelAppCacheCategoryChild,
    ].forEach((model) => {
        model.setData([]);
    });
};

AppCache.Update = function () {
    setiOSPWAIcons();
    appCacheLog("AppCache.Update: Starting");

    let afterPromise = function () {
        if (AppCache.isMobile) {
            appCacheLog("AppCache.Update: Starting mobile");
            AppCache.restrictedDisable();
        } else {
            appCacheLog("AppCache.Update: Starting desktop");
            AppCache.UpdateGetData();
        }

        // PushNotification
        try {
            // Mobile
            if (AppCache.enablePush && isCordova()) {
                setTimeout(function () {
                    if (AppCache.isRestricted) return;
                    appCacheLog("PushNotifications: Starting setup mobile");
                    sap.n.Push.setupPush();
                }, 1000 * 3);
            }

            // Desktop
            if (typeof setupNotifications === "function") {
                setTimeout(function () {
                    if (AppCache.isRestricted) return;
                    appCacheLog("PushNotifications: Starting setup desktop");
                    setupNotifications();
                }, 1000 * 3);
            }
        } catch (e) {
            console.log(e);
        }

        // Auto Update
        if (AppCache.enableAutoUpdate) AppCache.AutoUpdateMobileApp();

        // Enhancement
        if (sap.n.Enhancement.AfterUpdate) {
            try {
                sap.n.Enhancement.AfterUpdate();
            } catch (e) {
                appCacheError("Enhancement AfterUpdate " + e);
            }
        }
    };

    // Enhancement
    if (sap.n.Enhancement.BeforeUpdate) {
        try {
            let actions = [];
            actions.push(sap.n.Enhancement.BeforeUpdate());
            Promise.all(actions).then(function (values) {
                afterPromise();
            });
        } catch (e) {
            appCacheError("Enhancement BeforeUpdate " + e);
        }
    } else {
        afterPromise();
    }
};

AppCache.UpdateGetData = async function () {
    // Wrapped this in a promise so apps that use UpdateGetData can determine when it has completed.
    appCacheLog("AppCache.UpdateGetData: Starting");

    if (AppCache.StartApp) {
        // Start App
        sap.n.Launchpad.currentTile = {
            id: AppCache.StartApp.toUpperCase(),
        };

        sap.n.Launchpad.setAppWidthLimited(false);
        sap.ui.core.BusyIndicator.hide();
    } else if (AppCache.StartWebApp) {
        // Start WebApp
        sap.n.Launchpad.setAppWidthLimited(false);
        sap.ui.core.BusyIndicator.hide();
    }

    // Payload
    let dataRequest = {
        deviceType: sap.n.Launchpad.deviceType(),
        launchpad: AppCache.launchpadID,
        apps: [],
    };

    // Save Current Tiles/Category
    currCategory = JSON.parse(JSON.stringify(modelAppCacheCategory.oData));
    currCategoryChild = JSON.parse(JSON.stringify(modelAppCacheCategoryChild.oData));
    currTiles = JSON.parse(JSON.stringify(modelAppCacheTiles.oData));

    // Hide BusyIndicator of already cached data
    if (currTiles.length) sap.ui.core.BusyIndicator.hide();

    // Duplicate Check & System Split
    let uniqueApps = {};
    let appSystems = {};

    Array.isArray(modelAppCacheData.oData) &&
        modelAppCacheData.oData.forEach(function (data) {
            if (!data.appPath || data.appPath === "null") data.appPath = "";
            if (!uniqueApps[data.application + "|" + data.appPath])
                uniqueApps[data.application + "|" + data.appPath] = data;
        });

    for (let key in uniqueApps) {
        let keyData = key.split("|");
        let appPath = keyData[1];

        if (appPath) {
            if (!appSystems[appPath]) appSystems[appPath] = [];
            appSystems[appPath].push(uniqueApps[key]);
        } else {
            dataRequest.apps.push(uniqueApps[key]);
        }
    }

    appCacheLog("AppCache.UpdateGetData: Apps to check update before getTiles");
    appCacheLog(dataRequest);

    if (AppCache.isOffline) {
        sap.n.Customization.initOffline().then(() => {
            if (!AppCache.StartApp && !AppCache.StartWebApp) {
                sap.n.Launchpad.BuildMenu(false);
            }
            
            if (AppCache.StartApp) {
                AppCache.Load(AppCache.StartApp);
            }

            sap.n.Customization.Popover.init();
        });
        sap.ui.core.BusyIndicator.hide();
        return Promise.resolve();
    }

    // pre-build menu and tiles before we fetch GetTiles",
    if (!AppCache.StartApp && !AppCache.StartWebApp) {
        sap.n.Launchpad.BuildMenu(false);
    }

    const _tiles = await getCacheAppCacheTiles(false);
    const tilesInCache = !Array.isArray(_tiles) ? [] : _tiles;

    const res = await new Promise((resolve) => {
        sap.n.Planet9.function({
            id: dataSet,
            method: "GetTiles",
            data: dataRequest,
            success: function (data) {
                resolve({ success: true, data: data });
            },
            error: function (result, status) {
                sap.ui.core.BusyIndicator.hide();
                busyDialogStartup.close();

                // We must load existing versions of the start app if we failed to fetch new ones
                if (AppCache.StartApp) {
                    AppCache.Load(AppCache.StartApp);

                    // Start WebApp
                } else if (AppCache.StartWebApp) {
                    AppCache.LoadWebApp(AppCache.StartWebApp);
                }

                if (
                    result.responseJSON &&
                    result.responseJSON.status &&
                    isLaunchpadNotFound(result.responseJSON.status)
                ) {
                    showLaunchpadNotFoundError(result.responseJSON.status);
                }

                resolve({ success: false });
            },
        });
    });

    if (!res.success) {
        return;
    }
    const data = res.data;

    if (data.status && isLaunchpadNotFound(data.status)) {
        showLaunchpadNotFoundError(data.status);
        return;
    }

    modelAppCacheTileLayout.setData(data.tileLayout);
    setCacheAppCacheTileLayout();

    modelAppCacheGroupLayout.setData(data.tilegroupLayout);
    setCacheAppCacheGroupLayout();

    modelAppCacheLayout.oData.layoutLight = data.layoutLight;
    ModelData.Update(modelAppCacheLayout.oData.layouts, "id", modelAppCacheLayout.oData.layoutLight.id, modelAppCacheLayout.oData.layoutLight);

    modelAppCacheLayout.oData.layoutDark = data.layoutDark;
    ModelData.Update(modelAppCacheLayout.oData.layouts, "id", modelAppCacheLayout.oData.layoutDark.id, modelAppCacheLayout.oData.layoutDark);
    setCacheAppCacheLayout();

    sap.n.Design.loadLayout({
        force: true
    });

    if (
        !AppCache.isPublic && // for non-public launchpads
        typeof AppCache.userInfo === "object" &&
        Object.values(AppCache.userInfo).length > 0 && // user must be logged in
        tilesInCache.length === 0 &&
        data.tiles.length > 0 // no local tile getting loaded from server for the first time
    ) {
        busyDialogStartup.open();
    }

    // Blackout
    if (data.blackout) {
        sap.m.MessageBox.show(data.blackout.message, {
            title: data.blackout.title || "System Status",
            onClose: function (oAction) {
                if (AppCache.isMobile) {
                    if (AppCache.enablePasscode) {
                        AppCache.Lock();
                    } else {
                        AppCache.Logout();
                    }
                }
            },
        });
        return;
    }

    if (!data.categoryChilds) data.categoryChilds = [];

    modelAppCacheData.setData(data.apps);
    modelAppCacheTiles.setData(data.tiles);
    modelAppCacheCategory.setData(data.category);
    modelAppCacheCategoryChild.setData(data.categoryChilds);

    modelAppCacheSplitView.setData([]);
    neptune.Utils.userDefault.read({
        AREA: "LAUNCHPAD",
        GROUPING: "SPLITVIEW_DATA",
        NAME: AppCache.CurrentConfig,
    }, function(data) {
        if (!!data?.VAL0) {
            modelAppCacheSplitView.setData(JSON.parse(data.VAL0));
        }
        setCacheAppCacheSettings();
        sap.n.Launchpad.Splitview.startup();
    });

    if (data?.fav?.tiles) {
        modelAppCacheFavorites.setData({
            ENABLED: AppCache.enableFavorites,
            FAVORITES: data.fav.tiles
        });
    } else {
        modelAppCacheFavorites.setData({
            ENABLED: AppCache.enableFavorites,
            FAVORITES: []
        });
    }
    if (!Array.isArray(modelAppCacheMostused?.oData?.MOSTUSED)) {
        modelAppCacheMostused.setData({
            ENABLED: false,
            MOSTUSED: []
        });
    }

    // Check if UI5 Version Changed
    let ui5Version = localStorage.getItem("p9ui5version");
    if (ui5Version !== sap.ui.version) {
        data.apps.forEach(function (app) {
            app.invalid = true;
        });
        localStorage.setItem("p9ui5version", sap.ui.version);
    }

    // Get App Update from Other Systems
    let action = [];
    for (let key in appSystems) {
        action.push(AppCache.UpdateGetDataRemote(appSystems[key]));
    }
    AppCache.hideGlobalAjaxError = true;

    await new Promise((resolve) => {
        Promise.all(action).then(function (values) {
            AppCache.hideGlobalAjaxError = false;

            // Merge App Check Data from Remote Systems
            values.forEach(function (value) {
                // SAP
                if (value && value.result && value.result.apps) {
                    value.result.apps.forEach(function (app) {
                        modelAppCacheData.oData.push({
                            appType: app.apptype,
                            application: app.application,
                            updatedAt: app.updatedat,
                            invalid: app.invalid,
                            language: app.language,
                            appPath: app.apppath,
                        });
                    });
                } else {
                    if (value && value.length) ModelData.AddArray(AppCacheData, value);
                }
            });

            // Save Cache
            setCacheAppCacheData();
            setCacheAppCacheTiles();
            setCacheAppCacheCategory();
            setCacheAppCacheCategoryChild();
            // setCacheAppCacheFavorites();
            // setCacheAppCacheMostused();

            appCacheLog("AppCache.UpdateGetData: after getTiles and saved to database");

            sap.n.Ajax.SuccessGetMenu();
            sap.ui.core.BusyIndicator.hide();

            // Check Update of StartApp
            data.apps.forEach(function (app) {
                if (
                    sap.n.Launchpad.currentTile &&
                    sap.n.Launchpad.currentTile.actionApplication &&
                    app.application.toLowerCase() ===
                        sap.n.Launchpad.currentTile.actionApplication.toLowerCase() &&
                    app.invalid
                )
                    AppCache.Load(sap.n.Launchpad.currentTile.actionApplication);
            });

            // Fetch all Apps if on Mobile
            if (AppCache.isMobile && !isPWAEnabled()) {
                data.tiles.forEach(function (tile) {
                    if (tile.actionApplication || tile.tileApplication)
                        sap.n.Ajax.loadApps(tile);
                });
            }

            if (AppCache.StartApp) {
                AppCache.Load(AppCache.StartApp);

                // Start WebApp
            } else if (AppCache.StartWebApp) {
                AppCache.LoadWebApp(AppCache.StartWebApp);
            }

            resolve();
        });
    });

    modelAppCacheFavorites.oData.FAVORITES = modelAppCacheFavorites.oData.FAVORITES.filter(item=>{
        return !!(modelAppCacheTiles.oData.find(obj=>obj.id === item.id));
    });
    setCacheAppCacheFavorites();
    sap.n.Launchpad.saveFav();

    modelAppCacheMostused.oData.MOSTUSED = modelAppCacheMostused.oData.MOSTUSED.filter(item=>{
        return !!(modelAppCacheTiles.oData.find(obj=>obj.id === item.id));
    });
    setCacheAppCacheMostused();

    await sap.n.Customization.init(data);
    if (!AppCache.StartApp && !AppCache.StartWebApp) {
        sap.n.Launchpad.BuildMenu();
    }

    busyDialogStartup.close();
    sap.n.Customization.Popover.init();
};

AppCache.UpdateGetDataRemote = function (apps) {
    return new Promise(function (resolve, reject) {
        let url = "";
        let headers = {};
        let dataRequest = apps;
        let app = apps[0];
        let dataTile = ModelData.FindFirst(AppCacheTiles, "urlApplication", app.appPath);

        if (!dataTile) resolve();
        if (!apps.length) resolve();

        // URL
        if (dataTile.urlType === "SAP") {
            headers.NeptuneServer = dataTile.urlApplication;
            url =
                "/proxy/remote/" +
                encodeURIComponent(
                    dataTile.urlApplication + "/neptune/api/server/app_check_update"
                ) +
                "/" +
                dataTile.urlAuth;
        } else {
            url = "/api/functions/Launchpad/CheckUpdate?p9Server=" + dataTile.urlApplication;
            url =
                "/proxy/remote/" +
                encodeURIComponent(dataTile.urlApplication + url) +
                "/" +
                dataTile.urlAuth;
        }

        // Authentication ID
        headers["X-Auth-In-P9"] = dataTile.urlAuth;

        // Enhancement
        if (sap.n.Enhancement.RemoteSystemAuth) {
            try {
                sap.n.Enhancement.RemoteSystemAuth(headers);
            } catch (e) {
                appCacheError("Enhancement RemoteSystemAuth " + e);
            }
        }

        jsonRequest({
            url: url,
            data: JSON.stringify(dataRequest),
            headers: headers,
            success: function (data) {
                resolve(data);
            },
            error: function (result, status) {
                resolve([]);
            },
        });
    });
};

AppCache.enableExternalTools = function () {
    // SAP Conversational AI
    if (
        AppCache.config.sapcai_enabled &&
        AppCache.config.sapcai_channelid &&
        AppCache.config.sapcai_token &&
        !sap.n.Launchpad.isPhone()
    ) {
        window.webchatMethods = {
            getMemory: function (conversationId) {
                return {
                    merge: true,
                    memory: {
                        userName: AppCache.userInfo.name ?? "anonymous",
                        userId: AppCache.userInfo.username ?? "anonymous",
                        userLanguage: getLaunchpadLanguage(),
                        customData: AppCache.sapCAICustomData ?? {},
                    },
                };
            },
        };

        if (!document.getElementById("cai-webchat")) {
            document.body.appendChild(
                createScriptTag("https://cdn.cai.tools.sap/webchat/webchat.js", {
                    id: "cai-webchat",
                    channelId: AppCache.config.sapcai_channelid,
                    token: AppCache.config.sapcai_token,
                })
            );
        } else {
            let s = document.getElementById("cai-webchat");
            s.setAttribute("channelId", AppCache.config.sapcai_channelid);
            s.setAttribute("token", AppCache.config.sapcai_token);
        }
    } else {
        if (document.getElementById("cai-webchat"))
            document.getElementById("cai-webchat").style.visibility = "hidden";
    }

    // IBM Watson Assistant
    if (
        AppCache.config.watson_enabled &&
        AppCache.config.watson_integrationid &&
        AppCache.config.watson_region &&
        AppCache.config.watson_instanceid &&
        !sap.n.Launchpad.isPhone()
    ) {
        window.watsonAssistantChatOptions = {
            integrationID: AppCache.config.watson_integrationid,
            region: AppCache.config.watson_region,
            serviceInstanceID: AppCache.config.watson_instanceid,
            onLoad: function (instance) {
                instance.render();
            },
        };

        setTimeout(function () {
            document.head.appendChild(
                createScriptTag(
                    "https://web-chat.global.assistant.watson.appdomain.cloud/loadWatsonAssistantChat.js"
                )
            );
        });
    }
};

AppCache.disableExternalTools = function () {
    // SAP Conversational AI
    if (AppCache.config.sapcai_enabled) {
        if (document.getElementById("cai-webchat")) {
            let caiChat = document.getElementsByClassName("CaiAppChat")[0];
            let caiExpander = document.getElementsByClassName("CaiAppExpander")[0];

            if (caiChat && caiExpander) {
                caiChat.classList.remove("open");
                caiChat.classList.add("close");
                caiExpander.classList.remove("close");
                caiExpander.classList.add("open");
            }
        }
    }

    // IBM Watson Assistant
    if (AppCache.config.watson_enabled) {
        if (document.getElementById("WACWidget")) {
            let watsonChat = document.getElementById("WACWidget");
            let watsonExpander = document.getElementsByClassName(
                "WACLauncher__ButtonContainer"
            )[0];

            if (watsonChat && watsonExpander) {
                watsonChat.classList.add("WACWidget--closed");
                watsonExpander.classList.remove("WACLauncher__ButtonContainer--open");
            }
        }
    }
};

AppCache.Home = function () {
    location.hash = "Home";
};

AppCache._Home = function () {
    // Clear HashNavigation
    location.hash = "";

    let eventId;
    let preventDefault = false;

    const { currentTile } = sap.n.Launchpad;

    if (currentTile && currentTile.id) {
        eventId = currentTile.id;
    } else {
        eventId = AppCache.CurrentApp.toUpperCase();
    }

    if (sap.n.Apps[eventId] && sap.n.Apps[eventId].beforeHome) {
        sap.n.Apps[eventId].beforeHome.forEach(function (data) {
            let oEvent = new sap.ui.base.Event("beforeHome", new sap.ui.base.EventProvider());
            data(oEvent);
            if (oEvent.bPreventDefault) preventDefault = true;
            oEvent = null;
        });
    }

    // Default behaviour was avoided
    if (preventDefault) return;

    if (AppCache.StartApp) {
        return;
    }

    sap.n.Launchpad.SelectHomeMenu();
    sap.n.Launchpad.setHideHeader(false);
    sap.n.currentView = "";
    sap.n.Launchpad.setAppWidthLimited(!AppCache.isFullWidth);

    // Title
    sap.n.Launchpad.SetHeader();
    sap.n.Layout.setHeaderPadding();
    sap.n.Launchpad.handleAppTitle(AppCache.launchpadTitle);

    if (currentTile && currentTile.actionType === "A" && currentTile.urlApplication === "") {
        AppCache._Back();
    }
};

AppCache.Back = function () {
    if (AppCacheNav.getCurrentPage().sId === "AppCachePageStore") {
        AppCache.Home();
        return;
    }

    location.hash = "Back";
};

AppCache._Back = function () {
    // Clear HashNavigation
    location.hash = "";

    let eventId;
    let preventDefault = false;

    if (sap.n.Launchpad.currentTile && sap.n.Launchpad.currentTile.id) {
        eventId = sap.n.Launchpad.currentTile.id;
    } else {
        eventId = AppCache.CurrentApp.toUpperCase();
    }

    if (sap.n.Apps[eventId] && sap.n.Apps[eventId].beforeBack) {
        sap.n.Apps[eventId].beforeBack.forEach(function (data) {
            let oEvent = new sap.ui.base.Event("beforeBack", new sap.ui.base.EventProvider());
            data(oEvent);
            if (oEvent.bPreventDefault) preventDefault = true;
            oEvent = null;
        });
    }

    // Default behaviour was avoided
    if (preventDefault) return;

    // Close Objects
    AppCacheShellHelp.setVisible(false);
    AppCacheShellDebug.setVisible(false);
    sap.n.Shell.closeSidepanel();

    // Navigate
    try {
        if (AppCacheNav.getCurrentPage().sId.indexOf("page") > -1) {
            AppCacheNav.back();
        } else {
            if (!sap.n.Launchpad.backApp) {
                AppCache.Home();
            } else if (
                sap.n.Launchpad.backApp &&
                sap.n.currentView &&
                sap.n.currentView.sViewName === sap.n.Launchpad.backApp.sViewName
            ) {
                AppCache.Home();
            } else {
                AppCacheNav.backToPage(sap.n.Launchpad.backApp);
            }
        }
    } catch (err) {
        appCacheLog("Unable to navigate back", err);
        AppCache.Home();
    }

    //  Back Button - Only hide when top menu.
    let cat = AppCacheNav.getCurrentPage().sId;
    cat = cat.split("page")[1];

    let top = ModelData.FindFirst(AppCacheCategory, "id", cat);

    if (top) {
        if (!sap.n.Launchpad.hideBackIcon) AppCacheBackButton.setVisible(false);
        sap.n.Launchpad.setShellWidth();
        sap.n.Launchpad.MarkTopMenu(top.id);
        sap.n.Launchpad.handleAppTitle(AppCache.launchpadTitle);
    } else {
        if (!sap.n.Launchpad.hideBackIcon) AppCacheBackButton.setVisible(true);
        let sub = ModelData.FindFirst(AppCacheCategoryChild, "id", cat);
        sap.n.Launchpad.setShellWidth();
        sap.n.Launchpad.handleAppTitle(sub.title);
    }

    sap.n.Launchpad.backApp = AppCacheNav.getCurrentPage();
    sap.n.Launchpad.setHideHeader(false);

    // Clear currentTile
    sap.n.Launchpad.currentTile = {};
    sap.n.currentView = "";

    // Title
    sap.n.Launchpad.SetHeader();
    sap.n.Layout.setHeaderPadding();
};

AppCache.setEnablePasscodeEntry = function () {
    closeContentNavigator();
    sap.n.Launchpad.setHideTopButtons(true);

    if (Array.isArray(modelAppCacheUsers.oData) && modelAppCacheUsers.oData.length > 1) {
        butNumpadUserList.setEnabled(true);
        txtNumpadUserList.removeStyleClass("nepDisabled");
    } else {
        butNumpadUserList.setEnabled(false);
        txtNumpadUserList.addStyleClass("nepDisabled");
    }

    // Handle userInfo
    if (modelAppCacheUsers.oData.length === 1) AppCache.userInfo = modelAppCacheUsers.oData[0];
    AppCache.setUserInfo();

    delete AppCache.userInfo.azureToken;
    AppCache.translate(getLaunchpadLanguage());

    AppCache_boxPasscodeEntry.setVisible(true);
    AppCacheNav.to("AppCache_boxPasscodeEntry", "show");
    AppCache.handleUserMenu();

    // biometricAuthentication supported ?
    appCacheLog(
        "setEnablePasscodeEntry: Before biometric, enabled: " + AppCache.biometricAuthentication
    );

    if (
        !window.navigator.simulator &&
        window.cordova !== undefined &&
        AppCache.biometricAuthentication
    ) {
        const { os } = sap.ui.Device;
        const fp = sap.n.Fingerprint;
        if (os.ios && CID !== undefined) {
            fp.ios.checkSupport();
        } else if (os.android && window.FingerprintAuth) {
            FingerprintAuth.isAvailable(fp.android.onSupported, fp.android.notSupported);
        }
    }

    // Fetch Encrypted String
    const { userInfo } = AppCache;

    if (isCordova()) {
        if (isSecureKeyStorePluginAvailableOnCordova()) {
            const sksKey = `${AppCache.AppID}-${userInfo.username}`;
            cordova.plugins.SecureKeyStore.get(
                function (res) {
                    AppCache.Encrypted = res;
                    appCacheLog("setEnablePasscodeEntry: Got data from SecureKeyStorage");
                },
                function (err) {
                    AppCache.Encrypted = userInfo.auth;
                    appCacheLog(`setEnablePasscodeEntry: Error ${err}`);
                },
                sksKey
            );
        }
    } else {
        AppCache.Encrypted = userInfo.auth;
        appCacheLog("setEnablePasscodeEntry: Fallback solution");
    }
};

AppCache.setEnablePasscodeScreen = function () {
    if (!NumPad.Verify) return;

    closeContentNavigator();
    sap.n.Launchpad.setHideTopButtons(true);
    AppCache_inPasscode1.setEnabled(true);
    AppCache_inPasscode2.setEnabled(true);
    AppCache_inPasscode1.setMaxLength(AppCache.passcodeLength);
    AppCache_inPasscode2.setMaxLength(AppCache.passcodeLength);

    // use numeric keyboard for pincode and repeat pincode entry
    function pincodeInputAfterRendering() {
        let ref = this.getDomRef();
        if (ref.nodeName.toUpperCase() !== "INPUT") {
            ref = ref.querySelector('input[type="password"]');
        }

        if (typeof ref !== "undefined") {
            ref.setAttribute("inputmode", "numeric");
        }
    }
    AppCache_inPasscode1.onAfterRendering = pincodeInputAfterRendering;
    AppCache_inPasscode2.onAfterRendering = pincodeInputAfterRendering;

    AppCache.handleUserMenu();

    // PWA - Webauthn
    if (
        isPWAEnabled() &&
        AppCache.enablePasscode &&
        AppCache.config.enableWebAuth &&
        (window.PublicKeyCredential !== undefined ||
            typeof window.PublicKeyCredential === "function")
    ) {
        AppCache.userInfo.biometric = true;
        if (modelAppCacheUsers.oData.length > 1) AppCache.userInfo.biometric = false;
        if (
            modelAppCacheUsers.oData.length === 1 &&
            modelAppCacheUsers.oData[0].username !== AppCache.userInfo.username
        )
            AppCache.userInfo.biometric = false;

        if (AppCache.userInfo.biometric) {
            sap.n.Webauthn.register(AppCache.userInfo).then(function (userid) {
                if (userid === "ERROR") {
                    AppCacheNav.to("AppCache_boxPasscode", "show");
                } else {
                    // Store Authentication
                    const key = generatePBKDF2Key(userid, AppCache.deviceID);
                    const encrypted = encryptAES(AppCache.Auth, key.toString());
                    AppCache.Encrypted = encrypted.toString();
                    AppCache.userInfo.auth = encrypted.toString();

                    modelAppCacheUsers.oData[0].webauthid = userid;
                    setCacheAppCacheUsers();
                    AppCache.Update();
                }
            });
        } else {
            AppCacheNav.to("AppCache_boxPasscode", "show");
        }
    } else {
        AppCacheNav.to("AppCache_boxPasscode", "show");
    }
};

AppCache.setEnablePasswordScreen = function () {
    closeContentNavigator();
    sap.n.Launchpad.setHideTopButtons(true);
    AppCacheNav.to("AppCache_boxPassword", "show");
    AppCache.handleUserMenu();
};

AppCache.setEnableUsersScreen = function () {
    closeContentNavigator();
    sap.n.Launchpad.setHideTopButtons(true);
    AppCacheShellUser.setIcon("sap-icon://user-settings");
    AppCacheNav.to("AppCache_boxUsers", "show");
    AppCache.handleUserMenu();
    AppCache.calculateUserScreen();

    const users = modelAppCacheUsers.getData();
    const numUsers = users.length ?? 0;
    if (numUsers === 0) {
        AppCacheNav.to("AppCache_boxLogon", "show");
    }
};

AppCache.calculateUserScreen = function () {
    toolUsersFilter.focus();
};

AppCache.setEnableLogonScreen = function () {
    closeContentNavigator();
    sap.n.Launchpad.setHideTopButtons(true);

    // Login App
    if (AppCache.loginApp !== "" && AppCache.loginApp !== "null") {
        if (AppCache_boxLogonCustom.getContent().length === 0) {
            AppCache.loginApp();
            AppCache.setSettings(true);
        }
        AppCacheNav.to("AppCache_boxLogonCustom", "show");
        sap.n.Launchpad.setAppWidthLimited(false);
    } else {
        AppCache_boxLogon.setVisible(true);
        AppCacheNav.to("AppCache_boxLogon", "show");
    }
    
    AppCache_butCancelLogon.setVisible(modelAppCacheUsers.oData.length > 0);
    AppCache.handleUserMenu();

    // Biometric
    if (AppCache.biometricAuthentication && !AppCache.enablePasscode)
        sap.n.Fingerprint.getBasicAuth();

    AppCacheNav.rerender();
};

AppCache.handleUserMenu = function () {
    [
        AppCacheUserActionSettings,
        AppCacheUserActionSwitch,
        AppCacheUserActionLock,
        AppCacheUserActionChangePassword,
        AppCacheUserActionLogout,
        AppCacheUserActionCustomization,
    ].forEach(function (listItem) {
        listItem.setVisible(false);
    });

    AppCacheShellUser.setEnabled(true);
    NumPad.KeypressHandlerRemove();

    const pageId = AppCacheNav.getCurrentPage().sId;

    function setAppWidth() {
        if (
            [
                "AppCache_boxLogon",
                "AppCache_boxPassword",
                "AppCache_boxPasscode",
                "AppCache_boxPasscodeEntry",
                "AppCache_boxUsers",
                "AppCache_boxCaptcha",
            ].includes(pageId)
        ) {
            sap.n.Launchpad.setAppWidthLimited(true);
        }
    }

    function setShellTitle() {
        const titles = {
            AppCache_boxLogon: AppCache_Screen_Login.getText(),
            AppCache_boxPasscode: AppCache_Screen_PIN.getText(),
            AppCache_boxPasscodeEntry: AppCache_Screen_PINEntry.getText(),
            AppCache_boxUsers: AppCache_Screen_Users.getText(),
        };
        if (sap.n.Launchpad.isPhone() && titles[pageId] !== undefined) {
            AppCacheShellTitle.setVisible(true);
            AppCacheShellTitle.setText(titles[pageId]);
        }
    }

    function setSwitchUserOption() {
        if (
            [
                "AppCache_boxPassword",
                "AppCache_boxCaptcha",
                "AppCache_boxPasscodeEntry",
            ].includes(pageId)
        ) {
            AppCacheUserActionSwitch.setVisible(true);
        }
    }

    function setShellUserIcon() {
        if (["AppCache_boxPasscode", "AppCache_boxUsers"].includes(pageId)) {
            AppCacheShellUser.setEnabled(false);
        }
    }

    function handleNumPadKeyEvents() {
        // if (pageId === "AppCache_boxPasscodeEntry") {
        //     NumPad.KeypressHandlerSet();
        //     butNumpad1.focus();
        // }
    }

    setAppWidth();
    setShellTitle();
    setSwitchUserOption();
    setShellUserIcon();

    if (["AppCache_boxLogon", "AppCache_boxLogonCustom"].includes(pageId)) {
        if (AppCache.enablePasscode && modelAppCacheUsers.oData.length > 0) {
            AppCacheUserActionSwitch.setVisible(true);
        } else {
            AppCacheShellUser.setEnabled(false);
        }
    }

    if (
        ["AppCache_boxLogon", "AppCache_boxPasscodeEntry", "AppCache_boxPasscode"].includes(
            pageId
        )
    ) {
        AppCacheShellUser.setEnabled(false);
    }

    handleNumPadKeyEvents();
};

AppCache.getSettings = function () {
    appCacheLog("Getting settings from P9 server");

    let url = AppCache.Url + "/user/logon/types?launchpad=" + AppCache.launchpadID;
    if (AppCache.mobileClient) url += "&mobileclient=" + AppCache.mobileClient;

    request({
        type: "GET",
        url: url,
        success: function (data) {
            appCacheLog("Successfully received settings from P9 server");

            // Save Data
            AppCache.currentSettings = modelDataSettings.oData;
            modelDataSettings.setData(data);
            setCacheDataSettings();

            // Handle Startup Actions
            AppCache.setSettings(true);
        },
        error: function (result, status) {
            appCacheError("Error receiving settings from P9 server, using cached data");
        },
    });
};

AppCache.setSettings = function (skipStartup) {
    if (!modelDataSettings.oData.settings) {
        if (!skipStartup) {
            AppCache.Startup();
        }
        return;
    }

    let data = modelDataSettings.oData;
    let forceRestart = false;

    // Enhancement
    if (sap.n.Enhancement.BeforeSetSettingsMobile) {
        try {
            sap.n.Enhancement.BeforeSetSettingsMobile(data);
        } catch (e) {
            appCacheError("Enhancement BeforeSetSettingsMobile " + e);
        }
    }

    if ("serviceWorker" in navigator) {
        // TODO see if it works without timeout and on a public launchpad
        setTimeout(() => {
            setCachablePwaResources();
            ensurePWACache();
        }, 2000);
    }

    // Get System Name/Description
    if (data.settings.name) txtFormLoginSubTitle1.setText(data.settings.name);
    if (data.settings.description) txtFormLoginSubTitle2.setText(data.settings.description);

    data.logonTypes.sort(sort_by("description", false));

    AppCache_loginTypes.removeAllItems();

    if (
        (data.settingsLaunchpad && data.settingsLaunchpad.config && !data.settingsLaunchpad.config.hideLoginLocal) || 
        data.logonTypes.length > 0
    ) {
        AppCache_loginTypes.addItem(
            new sap.ui.core.Item({
                key: "local",
                text: "Local",
            })
        );
    }

    Array.isArray(data.logonTypes) && data.logonTypes
        .filter((loginType) => loginType.show)
        .filter((loginType) => loginType.type !== "saml" && loginType.type !== "oauth2")
        .forEach((loginType) => {
            AppCache_loginTypes.addItem(
                new sap.ui.core.Item({
                    key: loginType.id,
                    text: loginType.description,
                })
            );
        });
    if (!AppCache.config.hideLoginSelection) AppCache_loginTypes.setVisible(true);

    if (AppCache.config && AppCache.config.hideLoginSelection)
        AppCache_loginTypes.setVisible(false);

    if (AppCache.defaultLoginIDP) {
        AppCache_loginTypes.setSelectedKey(AppCache.defaultLoginIDP);
    }

    // Texts
    if (data.customizing.length) {
        if (
            data.customizing[0].txtLogin1Enable ||
            data.customizing[0].txtLogin2Enable ||
            data.customizing[0].txtLogin3Enable
        ) {
            AppCache_boxLogonLink.setVisible(true);
            AppCache_boxLogonLinkUsers.setVisible(true);
            AppCache_boxLogonLinkPasscode.setVisible(true);
            AppCache_boxLogonPasscodeEntry.setVisible(true);
        }

        if (data.customizing[0].txtLogin1Enable) {
            linkText1.setText(data.customizing[0].txtLogin1Label);
            linkText1.setVisible(true);
            linkPassText1.setText(data.customizing[0].txtLogin1Label);
            linkPassText1.setVisible(true);
            linkPinText1.setText(data.customizing[0].txtLogin1Label);
            linkPinText1.setVisible(true);
            linkUsersText1.setText(data.customizing[0].txtLogin1Label);
            linkUsersText1.setVisible(true);
        }

        if (data.customizing[0].txtLogin2Enable) {
            linkText2.setText(data.customizing[0].txtLogin2Label);
            linkText2.setVisible(true);
            linkSep1.setVisible(true);
            linkPassText2.setText(data.customizing[0].txtLogin2Label);
            linkPassText2.setVisible(true);
            linkPassSep1.setVisible(true);
            linkPinText2.setText(data.customizing[0].txtLogin2Label);
            linkPinText2.setVisible(true);
            linkPinSep1.setVisible(true);
            linkUsersText2.setText(data.customizing[0].txtLogin2Label);
            linkUsersText2.setVisible(true);
            linkUsersSep1.setVisible(true);
        }

        if (data.customizing[0].txtLogin3Enable) {
            linkText3.setText(data.customizing[0].txtLogin3Label);
            linkText3.setVisible(true);
            linkSep2.setVisible(true);
            linkPassText3.setText(data.customizing[0].txtLogin3Label);
            linkPassText3.setVisible(true);
            linkPassSep2.setVisible(true);
            linkPinText3.setText(data.customizing[0].txtLogin3Label);
            linkPinText3.setVisible(true);
            linkPinSep2.setVisible(true);
            linkUsersText3.setText(data.customizing[0].txtLogin3Label);
            linkUsersText3.setVisible(true);
            linkUsersSep2.setVisible(true);
        }
    }

    // AppCache - Launchpad
    if (data.settingsLaunchpad) {
        if (
            typeof data.settingsLaunchpad.enableNotifications !== "undefined" &&
            data.settingsLaunchpad.enableNotifications
        )
            AppCache.enablePush = data.settingsLaunchpad.enableNotifications;
        if (
            typeof data.settingsLaunchpad.limitWidth !== "undefined" &&
            data.settingsLaunchpad.limitWidth
        )
            AppCache.limitWidth = data.settingsLaunchpad.limitWidth;
        if (typeof data.settingsLaunchpad.startApp !== "undefined")
            AppCache.StartApp = data.settingsLaunchpad.startApp;

        // Config
        if (data.settingsLaunchpad.config) {
            if (data.settingsLaunchpad.config.hideLoginSelection)
                AppCache_loginTypes.setVisible(false);
            if (data.settingsLaunchpad.config.hideTopHeader) AppCache.hideTopHeader = true;
            
            if (data.settingsLaunchpad.config.languages) {
                sap.n.Launchpad.applyLanguages(data.settingsLaunchpad.config.languages);
            // } else {
            //     sap.n.Launchpad.setUserLanguage('EN');
            }

            if (data.settingsLaunchpad.config.loginTitle)
                txtFormLoginSubTitle1.setText(data.settingsLaunchpad.config.loginTitle);
            if (data.settingsLaunchpad.config.loginSubTitle)
                txtFormLoginSubTitle2.setText(data.settingsLaunchpad.config.loginSubTitle);

            // Enhancement
            if (data.settingsLaunchpad.config.enhancement) {
                try {
                    eval(data.settingsLaunchpad.config.enhancement);
                } catch (e) {
                    console.log(e);
                }
            }
        }
        
        // if (data.settingsLaunchpad.layout) {
        //     AppCache.layout = data.settingsLaunchpad.layout;
        // }
    }

    // AppCache - Mobile
    if (data.settingsMobile) {
        // Changes no restart
        if (typeof data.settingsMobile.pincodeTries !== "undefined")
            AppCache.numPasscode = data.settingsMobile.pincodeTries;
        if (typeof data.settingsMobile.autolock !== "undefined")
            AppCache.timerLock = data.settingsMobile.autolock;

        if (
            typeof data.settingsMobile.resetPasswordUrl !== "undefined" &&
            data.settingsMobile.resetPasswordUrl
        ) {
            AppCache.passUrlReset = data.settingsMobile.resetPasswordUrl;
            AppCache_resetPassword.setVisible(true);
        } else {
            AppCache_resetPassword.setVisible(false);
        }

        // Changes requires restart
        if (typeof data.settingsMobile.pincode !== "undefined") {
            AppCache.enablePasscode = data.settingsMobile.pincode;
            if (
                skipStartup &&
                AppCache.currentSettings &&
                AppCache.currentSettings.settingsMobile &&
                AppCache.currentSettings.settingsMobile.pincode !== data.settingsMobile.pincode
            )
                forceRestart = true;
        }

        if (typeof data.settingsMobile.fingerprint !== "undefined") {
            AppCache.biometricAuthentication = data.settingsMobile.fingerprint;
            if (
                skipStartup &&
                AppCache.currentSettings &&
                AppCache.currentSettings.settingsMobile &&
                AppCache.currentSettings.settingsMobile.fingerprint !==
                    data.settingsMobile.fingerprint
            )
                forceRestart = true;
        }

        // PIN Code
        if (
            typeof data.settingsMobile.pincodeLength !== "undefined" &&
            AppCache.passcodeLength !== data.settingsMobile.pincodeLength
        ) {
            AppCache.passcodeLength = data.settingsMobile.pincodeLength;
            modelAppCacheUsers.setData([]);
            if (
                skipStartup &&
                AppCache.currentSettings &&
                AppCache.currentSettings.settingsMobile
            )
                forceRestart = true;
        }

        // Auto Update
        if (data.settingsMobile.enableAutoUpdate) {
            AppCache.enableAutoUpdate = data.settingsMobile.enableAutoUpdate;
        } else {
            AppCache.enableAutoUpdate = false;
        }

        // MobileActive Version
        if (data.settingsMobile.activeVersion) {
            AppCache.AppVersionActive = data.settingsMobile.activeVersion;
            if (data.settingsMobile.builds && data.settingsMobile.builds.length)
                AppCache.AppVersionActiveID = data.settingsMobile.builds[0].id;
        }
    }

    // Custom Login App - Mobile Client
    if (AppCache.loginApp && AppCache_boxLogonCustom.getContent().length) {
        if (AppCache.loginAppSetSettings) AppCache.loginAppSetSettings(modelDataSettings.oData);
    }

    // Set Logon Screen
    sap.n.Utils.setupLoginScreen();

    // Startup
    if (!skipStartup) {
        AppCache.Startup();
    } else {
        if (forceRestart) {
            sap.m.MessageToast.show(AppCache_tRestartForced.getText());
            AppCache.Startup();
        }
    }

    // Clear
    AppCache.currentSettings = null;
};

AppCache.Startup = function () {
    startHasUserLoggedOutTimer();

    const langQueryParam = isLanguageSetInQueryParam();
    if (langQueryParam.exists) {
        setLaunchpadLanguage(langQueryParam.language);
        inAppCacheFormSettingsLang.setSelectedKey(langQueryParam.language);
    }

    // Check if CurrentConfig
    if (!AppCache.CurrentConfig) {
        sap.m.MessageToast.show(AppCache_tNoCurrentConfig.getText());
        return;
    }

    // Enhancement
    if (sap.n.Enhancement.global) {
        try {
            sap.n.Enhancement.global();
        } catch (e) {
            console.error("Enhancement global " + e);
        }
    }

    if (sap.n.Enhancement.BeforeStartup) {
        try {
            sap.n.Enhancement.BeforeStartup();
        } catch (e) {
            console.error("Enhancement BeforeStartup " + e);
        }
    }

    // Device ID
    AppCache.deviceID = localStorage.getItem("AppCacheID");

    if (!AppCache.deviceID) {
        AppCache.deviceID = ModelData.genID();
        localStorage.setItem("AppCacheID", AppCache.deviceID);
    }

    // Reset Password Link
    if (AppCache.passUrlReset && AppCache.passUrlReset !== "null")
        AppCache_resetPassword.setVisible(true);

    // Set Launchpad Icons
    setLaunchpadIcons();

    // Get Cache
    appCacheLog("AppCache.Startup: Loading Apps");
    getCacheAppCacheData();

    if (langQueryParam.exists) {
        setTimeout(() => {
            AppCache.translate(langQueryParam.language);
        }, 1000);
    }

    // Mobile or Desktop
    if (AppCache.isMobile) {
        if (isPWAEnabled()) {
            AppCache.Url = location.origin;
        }

        appCacheLog("AppCache.Startup: Mobile Client");

        // Status Bar - Fullscreen
        if (typeof StatusBar !== "undefined") {
            if (AppCache.isFullscreen) StatusBar.hide();
            StatusBar.overlaysWebView(false);
        }

        // Set URL for resources from Server
        imgWindows.setSrc(AppCache.Url + imgWindows.getSrc());
        imgAndroid.setSrc(AppCache.Url + imgAndroid.getSrc());
        imgIos.setSrc(AppCache.Url + imgIos.getSrc());

        setTimeout(function () {
            if (typeof navigator.splashscreen !== "undefined") navigator.splashscreen.hide();
        }, 300);

        if (AppCache.isPublic) {
            AppCacheShellUser.destroy();
            AppCache.Update();
        } else {
            appCacheLog("AppCache.Startup: Clear cookies");
            AppCache.clearCookies();

            appCacheLog("AppCache.Startup: Fetching users from database");
            getCacheAppCacheUsers(true);

            // if localStorage fails to decrypt
            if (
                typeof modelAppCacheUsers === "undefined" ||
                !Array.isArray(modelAppCacheUsers.oData)
            )
                modelAppCacheUsers.setData([]);

            // Passcode or Logon
            if (AppCache.enablePasscode) {
                // Set Visible Markers
                switch (AppCache.passcodeLength) {

                    case 6:
                        btnNumpadMark5.setVisible(true);
                        btnNumpadMark6.setVisible(true);
                        break;

                    case 8:
                        btnNumpadMark5.setVisible(true);
                        btnNumpadMark6.setVisible(true);
                        btnNumpadMark7.setVisible(true);
                        btnNumpadMark8.setVisible(true);
                        break;

                    default:
                        break;
                }

                if (modelAppCacheUsers.oData.length === 0) {
                    AppCache.setEnableLogonScreen();          
                
                } else if (Array.isArray(modelAppCacheUsers.oData) && modelAppCacheUsers.oData.length > 1) {
                    AppCache.setEnableUsersScreen();

                } else {
                    AppCache.setEnablePasscodeEntry();
                }

            } else {
                // Check for AutoLogin
                AppCacheLogonLocal.AutoLoginGet().then(function (auth) {
                    appCacheLog("AppCache.Startup: Autologin starting");

                    if (auth) {
                        let action = [];
                        AppCache.enableAutoLogin = true;
                        AppCacheLogonLocal.Init();
                        action.push(AppCacheLogonLocal.Relog(auth));
                        Promise.all(action).then(function (values) {
                            if (values[0] === "OK") {
                                AppCache.getUserInfo(auth);
                                appCacheLog(
                                    "AppCache.Startup: Autologin found user in database"
                                );
                            } else {
                                sap.m.MessageToast.show(AppCache_tWrongUserNamePass.getText());
                                AppCache.Logout();
                            }
                        });
                    } else {
                        AppCache.setEnableLogonScreen();
                        appCacheLog("AppCache.Startup: Autologin no user found in database");
                    }
                });
            }
        }
    } else {
        appCacheLog("AppCache.Startup: Desktop Client");

        AppCacheUserActionSettings.setVisible(true);
        AppCache.isRestricted = false;

        // Build URL
        AppCache.Url = location.origin;

        // Get User Data
        if (AppCache.isPublic) {
            AppCacheShellUser.destroy();
            AppCache.Update();
        } else {
            AppCache.getUserInfo();
        }
    }

    // App Title
    sap.n.Launchpad.handleAppTitle(AppCache.launchpadTitle);

    // // Custom Logo
    // if (AppCache.CustomLogo && AppCache.CustomLogo !== "null") {
    //     setCustomLogo();
    // } else {
    //     setDefaultLogo();
    // }

    // Check for OffLine
    if (!navigator.onLine) onOffline();

    sap.n.Launchpad.setAppWidthLimited(!AppCache.isFullWidth);

    // PWA Install
    setTimeout(function () {
        if (isRunningInStandaloneMode()) return;

        if (AppCache.enablePwa) {
            AppCacheUserActionInstallPwa.setVisible(true);

            if (modeldiaPWAInstall && modeldiaPWAInstall.oData) {
                const { visible } = modeldiaPWAInstall.getData();
                if (visible !== false) {
                    diaPWAInstall.open();
                }
            } else {
                diaPWAInstall.open();
            }
        }
    }, 500);
};

AppCache._getLoginQuery = function () {
    if (AppCache.mobileClient && AppCache.isMobile) {
        return "?mobileClientID=" + AppCache.mobileClient;
    }
    return "";
};
