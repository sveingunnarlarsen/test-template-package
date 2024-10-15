sap.n.Launchpad.HandleTilePress = function (dataTile, dataCat) {
    if (dataTile.navObject && dataTile.navAction) {
        location.hash = dataTile.navObject + "-" + dataTile.navAction;
    } else {
        location.hash = "";
        sap.n.Launchpad._HandleTilePress({
            dataTile: dataTile,
            dataCat: dataCat,
            navObjEventHandler: {}
        });
    }
};

sap.n.Launchpad._HandleTilePress = function (config) {
    
    const dataTile = config.dataTile;
    const dataCat = config.dataCat;
    const navObjEventHandler = config.navObjEventHandler;
    let appTitle;

    // Any tile ?
    if (!dataTile) return;

    // Clear Hash if no semantic navigation
    if (!dataTile.navObject && !dataTile.navAction) location.hash = "";

    // Avoid double start
    if (sap.n.Launchpad.currentTile && !sap.n.Launchpad.currentTile.actionURL) {
        if (sap.n.Launchpad.currentTile.id === dataTile.id) return;
    }

    AppCacheShellHelp.setVisible(false);
    sap.n.Launchpad.contextType = "Menu";

    // Start SidePanel
    if (dataTile.sidepanelApp && !sap.n.Launchpad.isPhone()) {
        sap.n.Shell.loadSidepanel(dataTile.sidepanelApp, {
            tabTitle: dataTile.sidepanelTitle
        });
    } else {
        sap.n.Shell.closeSidepanel();
    }

    // Set App Title
    if (sap.n.Launchpad.isPhone() || dataTile.subTitle === "" || dataTile.subTitle === null) {
        appTitle = dataTile.title;
    } else {
        appTitle = dataTile.title + " - " + dataTile.subTitle;
    }

    // Header Handling
    let hideHeader = false;
    if (sap.n.Launchpad.isDesktop() && dataTile.hideHeaderL) hideHeader = true;
    if (sap.n.Launchpad.isTablet() && dataTile.hideHeaderM) hideHeader = true;
    if (sap.n.Launchpad.isPhone() && dataTile.hideHeaderS) hideHeader = true;

    sap.n.Launchpad.setHideHeader(hideHeader);

    if (dataTile.urlApplication === null) dataTile.urlApplication = "";

    // Show back Button
    if (!dataTile.openDialog && !dataTile.openWindow) {
        if (
            dataTile.actionApplication ||
            dataTile.actionURL ||
            dataTile.actionWebApp ||
            dataTile.actionType === "F"
        ) {
            sap.n.Launchpad.currentTile = dataTile;
        }

        if (!sap.n.Launchpad.hideBackIcon) AppCacheBackButton.setVisible(true);
    }

    // Trace
    if (AppCache.enableTrace && !AppCache.isOffline) sap.n.Launchpad.traceTile(dataTile);

    // Enhancement
    if (sap.n.Enhancement.TileClick) {
        try {
            sap.n.Enhancement.TileClick(dataTile);
        } catch (e) {
            appCacheError("Enhancement TileClick " + e);
        }
    }

    // Adaptive Framework
    if (dataTile.actionType === "F") {
        neptune.Adaptive.getConfig(dataTile.settings.adaptive.id).then(function (config) {
            // Exists ?
            if (!config) {
                sap.m.MessageToast.show(AppCache_tAdaptiveNotFound.getText());
                return;
            }

            if (dataTile.openDialog) {
                AppCache.Load(config.application, {
                    appGUID: dataTile.id,
                    dialogShow: true,
                    dialogTitle: appTitle,
                    dialogHeight: dataTile.dialogHeight || "90%",
                    dialogWidth: dataTile.dialogWidth || "1200px",
                    startParams: config,
                });

                sap.n.Launchpad.contextType = "Tile";
                sap.n.Launchpad.contextTile = dataTile;
                location.hash = "";
            } else {
                // Start App
                sap.n.Launchpad.handleAppTitle(appTitle);
                sap.n.Launchpad.handleNavButton({
                    dataTile: dataTile,
                    dataCat: dataCat
                });
                sap.n.Launchpad.handleMostused(dataTile);

                AppCache.Load(config.application, {
                    appGUID: dataTile.id,
                    startParams: config,
                    openFullscreen: dataTile.openFullscreen,
                });

                // Sidepanel User Assistance
                if (dataTile.enableDocumentation && !AppCache.isPublic)
                    AppCacheShellHelp.setVisible(true);

                // Mark Open From
                if (sap.n.Shell.openSidePanelApps[dataTile.actionApplication])
                    sap.n.Shell.openSidepanel();
            }
        });

        return;
    }

    // Store Item
    if (dataTile.type === "storeitem") {
        // Get Mobile Client
        request({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: AppCache.Url + "/mobileClients/" + dataTile.storeItem.mobileClient,
            dataType: "json",
            success: function (data) {
                // Get Active Version
                data.activeBuild = {};
                data.builds.forEach(function (build) {
                    if (data.activeVersion === build.version) data.activeBuild = build;
                });

                // Hide image on phone
                if (sap.n.Launchpad.isPhone()) {
                    oTileImageCell.setVisible(false);
                } else {
                    oTileImage.setSrc(AppCache.Url + "/media/" + data.iconId);
                }

                // Install button
                AppCachePageStoreInstall.setEnabled(false);
                switch (sap.ui.Device.os.name) {
                    case "win":
                        if (data.buildWindows && data.activeBuild.dataWindows)
                            AppCachePageStoreInstall.setEnabled(true);
                        break;

                    case "Android":
                        if (data.buildAndroid && data.activeBuild.dataAndroid)
                            AppCachePageStoreInstall.setEnabled(true);
                        break;

                    case "iOS":
                        if (data.buildIOS && data.activeBuild.dataIos)
                            AppCachePageStoreInstall.setEnabled(true);
                        break;
                }

                modelAppCachePageStore.setData(data);
                AppCacheNav.to(AppCachePageStore);
            },
            error: function (data) {
                sap.m.MessageToast.show(data.status);
            },
        });

        return;
    }

    // Tile Group
    if (dataTile.actiongroup) {
        let dataCat = ModelData.FindFirst(AppCacheCategory, "id", dataTile.actiongroup);
        if (!dataCat)
            dataCat = ModelData.FindFirst(AppCacheCategoryChild, "id", dataTile.actiongroup);
        if (dataCat) {
            if (!sap.n.Launchpad.hideBackIcon) AppCacheBackButton.setVisible(true);
            sap.n.Launchpad.handleAppTitle(dataTile.title);
            sap.n.Launchpad.BuildTiles(dataCat, true);
        }
        return;
    }

    // External URL
    if (dataTile.actionURL) {
        sap.n.Launchpad.handleMostused(dataTile);

        if (dataTile.openWindow) {
            if (AppCache.isMobile) {
                window.open(dataTile.actionURL, "_blank", "location=0,status=0");
            } else {
                sap.m.URLHelper.redirect(dataTile.actionURL, dataTile.openWindow);
            }

            location.hash = "";
            AppCacheBackButton.setVisible(false);
        } else if (dataTile.openDialog) {
            sap.n.Launchpad.contextType = "Tile";
            sap.n.Launchpad.contextTile = dataTile;

            sap.n.Shell.openUrl(dataTile.actionURL, {
                dialogTitle: appTitle,
                dialogHeight: dataTile.dialogHeight || "90%",
                dialogWidth: dataTile.dialogWidth || "1200px",
            });

            location.hash = "";
            AppCacheBackButton.setVisible(false);
        } else {
            sap.n.Launchpad.handleAppTitle(appTitle);
            sap.n.Launchpad.handleNavButton({
                dataTile: dataTile,
                dataCat: dataCat
            });

            AppCacheNav.to(AppCache_boxURL, "show");

            if (dataTile.openFullscreen) {
                sap.n.Launchpad.setAppWidthLimited(false);
            } else {
                sap.n.Launchpad.setAppWidthLimited(true);
            }

            // Hide All
            hideChildren("#AppCache_URLDiv");

            // Check If element exist > Display or Create
            let el = elById(`iFrame${dataTile.id}`);

            if (el) {
                el.style.display = "block";
            } else {
                appendIFrame(querySelector("#AppCache_URLDiv"), {
                    id: `iFrame${dataTile.id}`,
                    frameborder: "0",
                    style: "border: 0;",
                    width: "100%",
                    height: "100%",
                    src: dataTile.actionURL,
                });
            }
        }

        return;
    }

    // Web App
    if (dataTile.actionWebApp) {
        if (dataTile.openWindow) {
            let url = "/webapp/" + dataTile.actionWebApp;
            if (dataTile.urlApplication) {
                url = dataTile.urlApplication + url;
            } else {
                url = AppCache.Url + url;
            }

            if (AppCache.isMobile) {
                window.open(url, "_blank", "location=0,status=0");
            } else {
                sap.m.URLHelper.redirect(url, dataTile.openWindow);
            }

            location.hash = "";
            AppCacheBackButton.setVisible(false);
        } else {
            sap.n.Launchpad.handleAppTitle(appTitle);

            const viewName = getWebAppViewName(dataTile.actionWebApp, dataTile.urlApplication);
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
        }

        return;
    }

    // Application
    if (dataTile.actionApplication) {
        if (dataTile.openDialog) {
            AppCache.Load(dataTile.actionApplication, {
                appGUID: dataTile.id,
                appPath: dataTile.urlApplication,
                appAuth: dataTile.urlAuth,
                appType: dataTile.urlType,
                dialogShow: true,
                dialogTitle: appTitle,
                sapICFNode: dataTile.sapICFNode || "",
                dialogHeight: dataTile.dialogHeight || "90%",
                dialogWidth: dataTile.dialogWidth || "1200px",
                startParams: dataTile.actionParameters,
            });

            sap.n.Launchpad.contextType = "Tile";
            sap.n.Launchpad.contextTile = dataTile;
            location.hash = "";
        } else if (dataTile.openWindow) {
            let url = `/app/${dataTile.actionApplication}`;
            if (dataTile.isPublic) url = `/public/app/${dataTile.actionApplication}`;

            if (dataTile.urlType === "SAP") {
                url = `/neptune/webapp/${dataTile.actionApplication}`;
            }

            if (dataTile.urlApplication) url = `${dataTile.urlApplication}${url}`;
            else url = `${AppCache.Url}${url}`;

            if (AppCache.isMobile) {
                window.open(url, "_blank", "location=0,status=0");
            } else {
                const type = localStorage.getItem(`lp-open-tile-${dataTile.id}`);
                if (!type) {
                    modeldiaTileOpen.setData({ url, id: dataTile.id });
                    diaTileOpen.open();
                } else {
                    openUrlIn({ url, type });
                }
            }
        } else {
            // Start App
            sap.n.Launchpad.handleAppTitle(appTitle);
            sap.n.Launchpad.handleNavButton({
                dataTile: dataTile,
                dataCat: dataCat
            });
            sap.n.Launchpad.handleMostused(dataTile);

            AppCache.Load(dataTile.actionApplication, {
                appGUID: dataTile.id,
                appPath: dataTile.urlApplication,
                appAuth: dataTile.urlAuth,
                appType: dataTile.urlType,
                sapICFNode: dataTile.sapICFNode,
                startParams: dataTile.actionParameters,
                openFullscreen: dataTile.openFullscreen,
            });

            // Sidepanel User Assistance
            if (dataTile.enableDocumentation && !AppCache.isPublic)
                AppCacheShellHelp.setVisible(true);

            // Mark Open From
            if (sap.n.Shell.openSidePanelApps[dataTile.actionApplication])
                sap.n.Shell.openSidepanel();
        }

        return;
    }
};

sap.n.Launchpad.handleAppTitle = function (appTitle) {
    if (sap.n.Layout.showAppTitle() && !AppCache.config.enableTopMenu) {
        AppCacheShellAppTitle.setText(appTitle || "");
    }
};

sap.n.Launchpad.handleFav = () => {

    modelAppCacheFavorites.oData.FAVORITES.forEach((fav, i) => {
        fav.SORT = i;
    });
    setCacheAppCacheFavorites();
    modelAppCacheFavorites.refresh();
    sap.n.Launchpad.saveFav();
};

sap.n.Launchpad.addFav = (dataTile) => {

    if (dataTile) {
        modelAppCacheFavorites.oData.FAVORITES.push({
            id: dataTile.id,
            TILE_TITLE: dataTile.title,
            TILE_INFO: dataTile.subTitle,
            TILE_ICON: dataTile.icon || "sap-icon://nep/app",
        });
    }
    sap.n.Launchpad.handleFav();
};

sap.n.Launchpad.delFav = (tileId) => {

    const ix = modelAppCacheFavorites.oData.FAVORITES.findIndex(fav => {
        return (fav.id === tileId);
    });

    if (ix < 0) {
        if (neptune.ui.debug) console.warn("sap.n.Launchpad.delFav. Tile id " + tileId + " not found!");
        return;
    }

    modelAppCacheFavorites.oData.FAVORITES.splice(ix, 1);
    sap.n.Launchpad.handleFav();
    return modelAppCacheFavorites.oData.FAVORITES;
};

sap.n.Launchpad.handleMostused = function (dataTile) {

    const mostused = modelAppCacheMostused.oData.MOSTUSED.find(obj=>obj.id === dataTile.id);

    if (!!mostused) {
        mostused.TOTAL = parseInt(mostused.TOTAL) + 1;
        mostused.UPDATED = new Date().getTime();

    } else {
        modelAppCacheMostused.oData.MOSTUSED.push({
            id: dataTile.id,
            TILE_ICON: dataTile.icon || "",
            TILE_INFO: dataTile.subTitle || "",
            TILE_TITLE: dataTile.title || "",
            TOTAL: 1,
            UPDATED: new Date().getTime(),
        });
    }

    let sorted = modelAppCacheMostused.oData.MOSTUSED.sort(function (a, b) {
        if (a.TOTAL > b.TOTAL) return -1;
        if (a.TOTAL < b.TOTAL) return 1;
        if (a.UPDATED > b.UPDATED) return -1;
        if (a.UPDATED < b.UPDATED) return 1;
        return 0;
    });
    setCacheAppCacheMostused();
};

sap.n.Launchpad.handleNavButton = (config) => {

    let navBarItem, overflowBlock, browserEventFn, navButtonBrowserEventFn, containerOpenApp, openAppPop, toolText;
    let dataCat = config.dataCat;
    let dataTile = config.dataTile;
    let navObjEventHandler = config.navObjEventHandler;
    let navAction;

    let startParams = {};
    if (config.dataLoad) {
        startParams = config.dataLoad.startParams;
        navObjEventHandler = config.dataLoad.navObjEventHandler;
    } else if (config.startParams) {
        startParams = config.startParams;
    }

    if (config.dataLoad) {

        if (config.dataLoad.navAction) {
            navAction = config.dataLoad.navAction;
        }

        dataCat = {};
        dataTile = {
            actionApplication: config.dataLoad.applid,
            id: config.dataLoad.appGUID,
            title: config.dataLoad.navTitle,
            subTitle: config.dataLoad.navInfo,
            icon: config.dataLoad.navIconSrc,
            cardImage: config.dataLoad.navIconImg,
            cardImageDark: config.dataLoad.navIconImgDark
        };
        sap.n.Launchpad.navContent[config.dataLoad.appGUID] = dataTile;

        sap.n.Launchpad.currentTile = {
            id: dataTile.id
        };

        navButtonBrowserEventFn = (oEvent) => {

            AppCache.Load(dataTile.actionApplication, {
                appGUID: dataTile.id,
                navTitle: config.dataLoad.navTitle,
                appWidthLimited: config.dataLoad.appWidthLimited,
                hideHeader: config.dataLoad.hideHeader
            });
            sap.n.Launchpad.currentTile = {
                id: dataTile.id
            };
            sap.n.Launchpad.overflowMenuClose();
        };
    } else {

        navButtonBrowserEventFn = (oEvent) => {
            sap.n.Launchpad.HandleTilePress(dataTile, dataCat);
            sap.n.Launchpad.overflowMenuClose();
        };
    }

    sap.n.Launchpad.addGlobaleActive({
        dataTile: dataTile,
        fn: navButtonBrowserEventFn
    });

    containerOpenApp = sap.ui.getCore().byId("__nepOpenAppContainer" + dataTile.id);

    if (!containerOpenApp) {

        containerOpenApp = new sap.m.HBox("__nepOpenAppContainer" + dataTile.id, {
            width: "100%",
            justifyContent: "SpaceBetween",
            alignItems: "Center",
            renderType: sap.m.FlexRendertype.Bare
        }).addStyleClass("nepOpenAppsContainer");

        sap.n.Launchpad.openApps.addItem(containerOpenApp);
        openAppMaster.setVisible(true);
        
        const appTitle = sap.n.Launchpad.translateTile("title", dataTile);

        const butOpenApp = new sap.m.Button("__nepOpenApp" + dataTile.id, {
            text: appTitle,
            icon: sap.n.Launchpad.getIconUrl(dataTile),
            iconFirst: true,
            press: navButtonBrowserEventFn
        }).addStyleClass("nepOpenAppsBtn nepOpenAppsBtnItem");
        containerOpenApp.addItem(butOpenApp);

        if (sap.n.Launchpad.tileContent[dataTile.id]) sap.n.Launchpad.tileContent[dataTile.id].title.push(butOpenApp);
        if (sap.n.Launchpad.tileContent[dataTile.id]) sap.n.Launchpad.tileContent[dataTile.id].state.push(butOpenApp);

        const butOpenAppClose = new sap.m.Button("__nepOpenAppClose" + dataTile.id, {
            icon: "sap-icon://sys-cancel",
            iconFirst: true,
            tooltip: AppCache_tClose.getText() + " " + butOpenApp.getText(),
            press: (oEvent) => {
                sap.n.Shell.closeTile(dataTile);
            }
        }).addStyleClass("sapUiTinyMarginBeginEnd");

        containerOpenApp.addItem(butOpenAppClose);
    }

    const navItem = {
        click: () => {
            if (openAppPop && (sap.ui.Device.system.phone || sap.ui.Device.system.tablet)) {
                openAppPop.close();
            }
            if (!!dataTile.screenId) {
                sap.n.Launchpad.setActiveTopMenu(neptune.byId("__nepTopMenu" + dataTile.screenId), true);
            }
        },
        timeout: null
    };

    // show open apps in header
    if (sap.n.Layout.activeAppsTop()) {

        // set all other buttons inactive
        AppCacheShellOpenApps.getItems().forEach(item => {
            item.removeStyleClass("nepTopMenuActive");
        });

        // New Button
        let tileButton = sap.ui.getCore().byId("but" + dataTile.id);

        if (!tileButton) {

            let butIcon = "sap-icon://chain-link";

            if (dataTile.icon && dataTile.icon.indexOf("sap-icon") > -1) {
                butIcon = dataTile.icon;
            } else if (dataTile.actionApplication) {
                butIcon = "sap-icon://nep/app";
            }

            tileButton = new sap.m.Button("but" + dataTile.id, {
                icon: butIcon
            }).addStyleClass("nepTopMenuBtn nepTopMenuAppBtn nepTopMenuActive");

            const title = dataTile.title;
            tileButton.setTooltip(AppCache_tOpen.getText() + ": " + title);

            tileButton.tileGuid = dataTile.id;

            browserEventFn = sap.n.Launchpad._createNavItem({
                config: config,
                navId: tileButton.sId,
                dataCat: dataCat,
                dataTile: dataTile,
                navAction: navAction,
                navObjEventHandler: navObjEventHandler,
                navItem: navItem
            });
            if (sap.n.Launchpad.tileContent[dataTile.id]) sap.n.Launchpad.tileContent[dataTile.id].state.push(tileButton);

            tileButton.attachPress(browserEventFn);
            AppCacheShellOpenApps.addItem(tileButton);

            var overflowHeaderBlock = new sap.m.VBox("but" + dataTile.id + "-overflow", {
                renderType: sap.m.FlexRendertype.Bare
            }).addStyleClass("nepNavBarApp");

            openAppPop = sap.n.Launchpad._createMouseOverMenuPopup({
                dataTile: dataTile,
                overflowBlock: overflowHeaderBlock,
                style: "nepOverflowMenu nepOverflowApp",
                offsetX: -100,
                offsetY: 0,
                placement: "Bottom"
            });

            overflowHeaderBlock.addItem(sap.n.Launchpad._createMouseOverMenuButton({
                dataTile: dataTile,
                browserEventFn: browserEventFn
            }));

            var menuFn = {
                popOverEntered: false,
                btnEntered: false
            };

            function _openAppPop_mouseenter(e) {
                menuFn.popOverEntered = true;
                tileButton.addStyleClass("nepTopMenuActiveHover");
            }

            function _openAppPop_mouseleave(e) {
                menuFn.popOverEntered = false;
                tileButton.removeStyleClass("nepTopMenuActiveHover");

                setTimeout(function() {
                    if (!menuFn.btnEntered) {
                        menuFn.btnEntered = false;
                        openAppPop.close();
                    }
                }, 10);
            }
            openAppPop.attachBrowserEvent("mouseenter", _openAppPop_mouseenter);
            openAppPop.attachBrowserEvent("mouseleave", _openAppPop_mouseleave);
            openAppPop.exit = function(e) {
                openAppPop.detachBrowserEvent("mouseenter", _openAppPop_mouseenter);
                openAppPop.detachBrowserEvent("mouseleave", _openAppPop_mouseleave);
            };

            function _tileButton_mouseenter(e) {
                openAppPop.openBy(tileButton);
                menuFn.btnEntered = true;
            }

            function _tileButton_mouseleave(e) {
                menuFn.btnEntered = false;

                setTimeout(function() {
                    if (!menuFn.popOverEntered) {
                        menuFn.popOverEntered = false;
                        openAppPop.close();
                    }
                }, 10);
            }
            tileButton.attachBrowserEvent("mouseenter", _tileButton_mouseenter);
            tileButton.attachBrowserEvent("mouseleave", _tileButton_mouseleave);
            tileButton.exit = function(e) {
                tileButton.detachBrowserEvent("mouseenter", _tileButton_mouseenter);
                tileButton.detachBrowserEvent("mouseleave", _tileButton_mouseleave);
            };
        }

    } else if (sap.n.Layout.activeAppsSide()) {

        navBarItem = sap.ui.getCore().byId("but" + dataTile.id);

        if (!navBarItem) {

            navBarItem = new sap.m.HBox("but" + dataTile.id, {
                renderType: sap.m.FlexRendertype.Bare
            }).addStyleClass("nepNavBarItem");
            if (sap.n.Launchpad.tileContent[dataTile.id]) sap.n.Launchpad.tileContent[dataTile.id].state.push(navBarItem);

            const navBarState = new sap.m.VBox("but" + dataTile.id + "-state", {
                renderType: sap.m.FlexRendertype.Bare
            }).addStyleClass("nepNavBarState");

            const navBarApp = new sap.m.VBox("but" + dataTile.id + "-app", {
                renderType: sap.m.FlexRendertype.Bare
            }).addStyleClass("nepNavBarApp");

            navBarItem.addItem(navBarState);
            navBarItem.addItem(navBarApp);

            browserEventFn = sap.n.Launchpad._createNavItem({
                config: config,
                navId: navBarItem.sId,
                dataCat: dataCat,
                dataTile: dataTile,
                navAction: navAction,
                navObjEventHandler: navObjEventHandler,
                navItem: navItem
            });

            navBarApp.addItem(sap.n.Launchpad._createMouseOverMenuButton({
                dataTile: dataTile,
                browserEventFn: browserEventFn
            }));

            overflowBlock = new sap.m.HBox("but" + dataTile.id + "-overflow", {
                renderType: sap.m.FlexRendertype.Bare
            }).addStyleClass("nepNavBarItem");
            if (sap.n.Launchpad.tileContent[dataTile.id]) sap.n.Launchpad.tileContent[dataTile.id].state.push(overflowBlock);

            const navOverflowState = new sap.m.VBox("but" + dataTile.id + "-overflow-state", {
                renderType: sap.m.FlexRendertype.Bare
            }).addStyleClass("nepNavBarState");

            const navOverflowApp = new sap.m.VBox("but" + dataTile.id + "-overflow-app", {
                renderType: sap.m.FlexRendertype.Bare
            }).addStyleClass("nepNavBarApp nepNavBarAppOverflow");

            overflowBlock.addItem(navOverflowState);
            overflowBlock.addItem(navOverflowApp);

            navOverflowApp.addItem(sap.n.Launchpad._createMouseOverMenuButton({
                navId: overflowBlock.sId,
                dataTile: dataTile,
                browserEventFn: browserEventFn,
                overflow: true
            }));

            let offsetX = -67;
            if ($("html").attr("dir") === "rtl") {
                offsetX = 67;
            }
            openAppPop = sap.n.Launchpad._createMouseOverMenuPopup({
                dataTile: dataTile,
                overflowBlock: overflowBlock,
                style: "nepOpenAppsPopup",
                offsetX: offsetX,
                offsetY: 0,
                placement: "Right"
            });

            navBarContent.addItem(navBarItem);

            const _mouseenter = (e) => {
                if (launchpadContentNavigator.getWidth() === AppCache.navBarWidth) {
                    return;
                }
                openAppPop.openBy(navBarItem);

                if (sap.ui.Device.system.phone || sap.ui.Device.system.tablet) {
                    clearTimeout(navItem.timeout);
                    navItem.timeout = setTimeout(() => {
                        try {
                            openAppPop.close();
                        } catch (e) {}
                    }, 3000);
                }
            };
            navBarItem.attachBrowserEvent("mouseenter", _mouseenter);
            navBarItem.exit = (e) => {
                navBarItem.detachBrowserEvent("mouseenter", _mouseenter);
            };

            const _mouseleave = (e) => {
                openAppPop.close();
            };
            overflowBlock.attachBrowserEvent("mouseleave", _mouseleave);
            overflowBlock.exit = (e) => {
                overflowBlock.detachBrowserEvent("mouseleave", _mouseleave);
            };
        }

        if (sap.n.Launchpad.showNavBar() && $("#launchpadContainer").width() > sap.n.Launchpad.navigationItemLimit) {
            sap.n.Launchpad.setContentNavigatorWidth(sap.n.Launchpad.openAppsSideMenuSize);

            const state = (sap.n.Launchpad.openAppsSideMenuSize === "68px") ? "closed" : "open";

            sap.n.Layout.setHeaderPadding();
        }
        // Set Active
        sap.n.Launchpad.setActiveIcon(navBarItem.sId);
    }
};

sap.n.Launchpad.deleteGlobaleActive = (config) => {
    ModelData.Delete(ListGlobalSearchActive, "id", config.guid);
    modelListGlobalSearchActive.refresh();
};

sap.n.Launchpad.addGlobaleActive = (config) => {

    let butIcon = "sap-icon://nep/app";

    if (config.dataTile.icon && config.dataTile.icon.indexOf("sap-icon") > -1) {
        butIcon = config.dataTile.icon;
    } 
    
    ModelData.Update(ListGlobalSearchActive, "id", config.dataTile.id, {
        id: config.dataTile.id,
        parent: openAppMaster.getText(),
        text: sap.n.Launchpad.translateTile("title", config.dataTile) ,
        icon: butIcon,
        timestamp: Date.now(),
        openFn: config.fn,
        deleteFn: () => {
            sap.n.Shell.closeTile(config.dataTile);
        }

    });
    modelListGlobalSearchActive.refresh();
};

sap.n.Launchpad._createNavItem = (obj) => {

    let browserEventFn;
    const config = obj.config;
    const navId = obj.navId;
    const dataCat = obj.dataCat;
    const dataTile = obj.dataTile;
    const navAction = obj.navAction;
    const navObjEventHandler = obj.navObjEventHandler;
    const navItem = obj.navItem;

    if (navAction) {

        browserEventFn = (oEvent) => {
            sap.n.Launchpad.currentTile = {};
            AppCache.CurrentApp = "";

            navAction(oEvent);
            sap.n.Launchpad.setActiveIcon(navId);
            navItem.click();
        };

    } else if (config.dataLoad) {

        browserEventFn = (oEvent) => {
            clearTimeout(navBarTimeout);
            sap.n.Launchpad.setActiveIcon(navId);
            sap.n.Launchpad.currentTile = dataTile;

            if (!config.dataLoad.appGUID) config.dataLoad.appGUID = dataTile.id;

            AppCache.Load(dataTile.actionApplication, config.dataLoad);

            sap.n.Launchpad.setAppWidthLimited(config.dataLoad.appWidthLimited);
            navItem.click();
        };

    } else {

        browserEventFn = (oEvent) => {
            clearTimeout(navBarTimeout);
            sap.n.Launchpad.setActiveIcon(navId);

            AppCache.CurrentApp = "";
            sap.n.Launchpad.currentTile = {};

            sap.n.Launchpad.HandleTilePress(dataTile, dataCat);
            navItem.click();
        };
    }
    if (navObjEventHandler) navObjEventHandler.updateNavigationItemFn = (config) => {

        if (!config) return;

        const btn = sap.ui.getCore().byId("but" + dataTile.id);
        if (!btn) return;

        if (config.title && sap.n.Launchpad.tileContent[dataTile.id]) {
            sap.n.Launchpad.tileContent[dataTile.id].title.forEach(title => {
                title.setText(config.title);
            });
        }
        if (config.subTitle && sap.n.Launchpad.tileContent[dataTile.id]) {
            sap.n.Launchpad.tileContent[dataTile.id].info.forEach(info => {
                info.setText(config.subTitle);
            });
        }
        if (config.title && sap.n.Launchpad.tileContent[dataTile.id]) {
            sap.n.Launchpad.tileContent[dataTile.id].abbreviation.forEach(title => {
                sap.n.Launchpad.updateAbbreviation(abbreviation, config.title);
            });
        }
        if (config.state) {
            sap.n.Launchpad.tileContent[dataTile.id].state.forEach(obj => {
                sap.n.Launchpad.setNavState(obj, config.state);
            });
        }
    };
    return browserEventFn;
};

sap.n.Launchpad._createMouseOverMenuPopup = (obj) => {

    const dataTile = obj.dataTile;
    const overflowBlock = obj.overflowBlock;
    const style = obj.style;
    const offsetX = obj.offsetX;
    const offsetY = obj.offsetY;
    const placement = obj.placement;

    const openAppPop = new sap.m.Popover("but" + dataTile.id + "-popup", {
        bounce: false,
        horizontalScrolling: false,
        modal: false,
        offsetX: offsetX,
        offsetY: offsetY,
        placement: placement,
        showArrow: false,
        showHeader: false,
        verticalScrolling: false
    }).addStyleClass(style);
    if (sap.n.Launchpad.tileContent[dataTile.id]) sap.n.Launchpad.tileContent[dataTile.id].state.push(openAppPop);

    const blockAppPop = new sap.m.FlexBox("__nep" + ModelData.genID(), {
        fitContainer: true,
        renderType: sap.m.FlexRendertype.Bare
    });
    openAppPop.addContent(blockAppPop);

    const blockRowAppPop = new sap.m.VBox("__nep" + ModelData.genID(), {
        renderType: sap.m.FlexRendertype.Bare
    }).addStyleClass("nepContainerOpenApps");
    openAppPop.addContent(blockAppPop);

    blockAppPop.addItem(blockRowAppPop);
    blockRowAppPop.addItem(overflowBlock);

    sap.n.Launchpad.openAppPops[overflowBlock.getId()] = overflowBlock;

    // draw the popup in the DOM, so that it is ready instantly when mouse over!
    if (!AppCache.hideMainMenu) {
        openAppPop.openBy(AppCacheShellMenuOverflow);
        openAppPop.close();
    }
    return openAppPop;
};

sap.n.Launchpad._createMouseOverMenuButton = (obj) => {

    const dataTile = obj.dataTile;
    const browserEventFn = obj.browserEventFn;
    const overflow = obj.overflow || false;
    const title = sap.n.Launchpad.translateTile("title", dataTile),
    const overflowIconId = (overflow) ? "-overflow-icon" : "";

    const boxTop = new sap.m.HBox("__nep" + ModelData.genID(), {
        width: "100%",
        justifyContent: "SpaceBetween",
        height: "2.75rem"
    }).addStyleClass("nepMouseOverMenuButton");

    const boxIconText = new sap.m.HBox("__nep" + ModelData.genID(), {});
    boxIconText.addStyleClass("nepNavBarBoxIconText");

    const _boxIconText_delegate = {
        onclick: (e) => {
            browserEventFn();
        }
    };
    boxIconText.addEventDelegate(_boxIconText_delegate);
    boxIconText.exit = () => {
        boxIconText.removeEventDelegate(_boxIconText_delegate);
    };
    boxTop.addItem(boxIconText);

    const boxIcon = new sap.m.VBox("__nepBoxIcon" + dataTile.id + overflowIconId, {
        renderType: "Bare",
        width: "60px",
        justifyContent: "Center",
        alignItems: "Center"
    }).addStyleClass("nepMouseOverMenuButtonIcon");
    boxIconText.addItem(boxIcon);

    if (!!dataTile.cardImage && !sap.n.Layout.activeAppsTop()) {
        
        let imageUrl = AppCache.Url + dataTile.cardImage;
        if (AppCache.isMobile && dataTile.cardImageData) {
            imageUrl = dataTile.cardImageData;
        }

        sap.n.Launchpad.tileIconImages[dataTile.id] = {
            light: imageUrl
        };

        const imgMouseOverMenu = new sap.m.Image("__nep" + ModelData.genID(), {
            src: imageUrl,
            densityAware: false,
            alt: title,
            decorative: false,
            tooltip: title
        }).addStyleClass("nepTileImage");
        boxIcon.addItem(imgMouseOverMenu);

        if (sap.n.Launchpad.tileContent[dataTile.id]) sap.n.Launchpad.tileContent[dataTile.id].nav.push(imgMouseOverMenu);

    } else {

        butIcon = "sap-icon://chain-link";

        if (dataTile.icon && dataTile.icon.indexOf("sap-icon") > -1) {
            butIcon = dataTile.icon;
        }

        const icoMouseOverMenu = new sap.ui.core.Icon("__nep" + ModelData.genID(), {
            height: "2.75rem",
            size: "1.75rem",
            src: butIcon,
            width: "60px",
            alt: title,
            decorative: false,
            tooltip: title
        }).addStyleClass("nepTileClickable nepNavBarAppIcon");

        boxIcon.addItem(icoMouseOverMenu);
    }

    if (AppCache.navAbbreviation) {

        let abbr = title.substr(0, 2);
        const arr = title.split(" ");
        if (arr.length > 1) {
            abbr = arr[0].substr(0, 1) + arr[1].substr(0, 1);
        }
        const textAbbreviation = new sap.m.Text("__nep" + ModelData.genID(), {
            text: abbr
        }).addStyleClass("nepNavBarAbbreviation");
        boxIcon.addItem(textAbbreviation);

        if (sap.n.Launchpad.tileContent[dataTile.id]) sap.n.Launchpad.tileContent[dataTile.id].abbreviation.push(textAbbreviation);
    }

    if (!overflow) {
        const _boxIcon_delegate = {
            onkeypress: (e) => {
                if (e.key === 'Enter') {
                    browserEventFn();
                }
            },
            onAfterRendering: () => {
                $("#" + boxIcon.getId()).attr("tabindex", "0");
                $("#" + boxIcon.getId()).attr("role", "button");
                $("#" + boxIcon.getId()).attr("role", "button");
                $("#" + boxIcon.getId()).attr("aria-label", textTitle.getId());
            }
        };
        boxIcon.addEventDelegate(_boxIcon_delegate);
        boxIcon.exit = () => {
            boxIcon.removeEventDelegate(_boxIcon_delegate);
        };
    }

    const boxTitle = new sap.m.VBox("__nep" + ModelData.genID(), {
        renderType: "Bare",
        justifyContent: "Center"
    }).addStyleClass("sapUiTinyMarginBegin nepNavBarBoxTitle");
    boxIconText.addItem(boxTitle);

    textTitle = new sap.m.Text("__nep" + ModelData.genID(), {
        wrapping: false,
        text: title
    }).addStyleClass("nepTileClickable nepNavBarAppTitle");
    if (sap.n.Launchpad.tileContent[dataTile.id]) sap.n.Launchpad.tileContent[dataTile.id].title.push(textTitle);

    boxTitle.addItem(textTitle);

    textSubTitle = new sap.m.Text("__nep" + ModelData.genID(), {
        wrapping: false,
        text: sap.n.Launchpad.translateTile("TILE_INFO", dataTile),
    }).addStyleClass("nepTileClickable nepNavBarAppText");
    boxTitle.addItem(textSubTitle);
    if (sap.n.Launchpad.tileContent[dataTile.id]) sap.n.Launchpad.tileContent[dataTile.id].info.push(textSubTitle);

    const layoutClose = new sap.m.VBox("__nep" + ModelData.genID(), {
        alignItems: "Center",
        justifyContent: "Center",
        width: "40px"
    });
    boxTop.addItem(layoutClose);

    const butClose = new sap.ui.core.Icon("__nep" + ModelData.genID(), {
        size: "1.375rem",
        src: "sap-icon://sys-cancel",
        press: (oEvent) => {
            sap.n.Shell.closeTile(dataTile);
        }
    }).addStyleClass("nepNavBarAppClose");
    layoutClose.addItem(butClose);

    butClose.onAfterRendering = () => {
        let elem = butClose.getDomRef();
        elem.setAttribute("tabindex", "-1");
    };

    return boxTop;
};