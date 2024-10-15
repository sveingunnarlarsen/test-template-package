sap.n.Launchpad = {

    theme: {
        light: "Light",
        dark: "Dark",
        system: {
            default: 0,
            light: 1,
            dark: 2
        }
    },
    guid: {
        fav: "f0000000-0000-0000-0000-000000000fav",      // sap.n.Launchpad.guid.fav
        recent: "f0000000-0000-0000-0000-000000recent",   // sap.n.Launchpad.guid.recent
        mostused: "f0000000-0000-0000-0000-0000mostused"  // sap.n.Launchpad.guid.mostused
    },
    defaultTextLevel: {
        title: "H4",
        info: "H5"
    },
    initSideBar: false,
    Timers: [],
    menuArray: [],
    menuIndex: 0,
    useMenuList: false,
    setShellBackground: true,
    currLayout: "",
    currLayoutContent: "",
    hideBackIcon: false,
    openApps: openApps,
    openAppExpanded: false,
    openAppsSideMenuSize: "68px",
    verticalMenuLimit: 1024,
    openAppPops: {},

    openAppsLimit: 800,
    sidePanelWidth: "300px",
    sidePanelContentLimit: 300,
    sidePanelAppLimit: 220,
    verticalMenuDefault: 260,
    verticalMenuItemsDefault: 1,
    navigationItemLimit: 800,
    sideDrag: null,
    navContent: {},
    tileContent: {},
    tileGroupsInPage: {},
    tileIconImages: {},
    tileImages: {},

    device: {
        DESKTOP: "D",
        TABLET: "T",
        PHONE: "P",
    }
};

sap.n.Launchpad.UpdateTileInfo = function (data) {
    // P8 Compability
};

sap.n.Launchpad.afterTheme = () => {

    //Only when coming from apply Layout
    if (!sap.n.Launchpad.layoutConfig) return;
    if (neptune.debug.layout) console.warn("sap.n.Launchpad.after Theme: " + sap.n.Launchpad.layoutConfig.layout.id + "-" + sap.n.Launchpad.layoutConfig.layout.NAME);

    AppCache.CurrentLayout = sap.n.Launchpad.layoutConfig.layout;

    sap.n.Launchpad.layoutConfig = null;
    neptune.Style.setCssVariables(AppCache.CurrentLayout.THEME ?? '');

    const style = neptune.Style.getLayoutCss({
        layout: AppCache.CurrentLayout,
        mediaUrl: AppCache.mediaUrl,
        imageUrl: AppCache.imageUrl,
        isMobile: AppCache.isMobile,
        // imageData: AppCache.imageData,
        isHCP: AppCache.isHCP,
        tileLayoutData: sap.n.Launchpad.getTileLayout(),
        groupLayoutData: sap.n.Launchpad.getGroupLayout()
        // favicon: AppCache.favicon
    });

    //Not mobile, only desktop and PWA
    if (!AppCache.isMobile || AppCache.enablePwa) {
        const link = document.querySelector("link[type='image/x-icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = style.faviconUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    sap.n.Launchpad.buildScreenCss();

    for (const key in sap.n.Launchpad.tileIconImages) {
        let iconImageUrl = sap.n.Launchpad.tileIconImages[key].light;
        if (!!sap.n.Launchpad.tileIconImages[key].dark && AppCache.CurrentLayout.THEME_BRIGHTNESS === "Dark") {
            iconImageUrl = sap.n.Launchpad.tileIconImages[key].dark;
        }
        if (sap.n.Launchpad.tileContent[key]) sap.n.Launchpad.tileContent[key].cardHeader.forEach(cardHeader => cardHeader.setIconSrc(iconImageUrl));
        if (sap.n.Launchpad.tileContent[key]) sap.n.Launchpad.tileContent[key].iconImage.forEach(iconImage => iconImage.setSrc(iconImageUrl));
        if (sap.n.Launchpad.tileContent[key]) sap.n.Launchpad.tileContent[key].nav.forEach(nav => nav.setSrc(iconImageUrl));
    }

    for (const image in sap.n.Launchpad.tileImages) {
        let imageUrl = sap.n.Launchpad.tileImages[image].light;
        if (!!sap.n.Launchpad.tileImages[image].dark && AppCache.CurrentLayout.THEME_BRIGHTNESS === "Dark") {
            imageUrl = sap.n.Launchpad.tileImages[image].dark;
        }
        sap.n.Launchpad.tileContent[image].cardImage.forEach(cardImage => {
            const domElem = neptune.byId(cardImage);
            if (!!domElem) domElem.setSrc(imageUrl);
        });
    }

    AppCacheShellLogoDesktop.setSrc(style.logoDesktop);
    AppCacheShellLogoMobile.setSrc(style.logoMobile);
    AppCacheShellBrandImgBottom.setSrc(style.brandImg);

    sap.n.Launchpad.setHeaderWidth(AppCache.CurrentLayout);
    sap.n.Launchpad.setShellWidth();

    AppCache.isFullWidth = (AppCache.CurrentLayout.SHELL_WIDTH === "Full");
    sap.n.Launchpad.setAppWidthLimited(!AppCache.isFullWidth);

    document.getElementById("NeptuneStyleCSSDiv").innerHTML = style.css;
    sap.n.Layout.setHeaderPadding();
};

sap.n.Launchpad.setVisible = {
    AppCacheShellNotif: (visible) => {
        AppCacheShellNotif.setVisible(visible || false);
    }
};

sap.n.Display = {
    flex: (elem)=>{
        elem.removeStyleClass("nepDisplayNone");
        elem.addStyleClass("nepDisplayFlex");
    },
    none: (elem)=>{
        elem.removeStyleClass("nepDisplayFlex");
        elem.addStyleClass("nepDisplayNone");
    }
}

sap.n.Launchpad.sidepanelOpenMode = ()=>{
    const canvas = launchpadContent.getDomRef() && launchpadContent.getDomRef().offsetWidth || 0;
    const menuWidth = +launchpadContentMenu.getWidth().replace("px", "");
    const navWidth = +launchpadContentNavigator.getWidth().replace("px", "");
    const sideLimit = canvas - menuWidth - navWidth - sap.n.Launchpad.sidePanelContentLimit;

    return (sideLimit - sap.n.Launchpad.sidePanelContentLimit < 0) ? "dialog" : "splitter";
};

sap.n.Launchpad.sidepanelOpen = () => {

    if (launchpadContentSideApp.getWidth() !== "0px") return;

    modelAppCacheSettings.oData.SIDEPANEL_WIDTH = (modelAppCacheSettings.oData.SIDEPANEL_WIDTH < sap.n.Launchpad.sidePanelWidth) ? sap.n.Launchpad.sidePanelWidth : modelAppCacheSettings.oData.SIDEPANEL_WIDTH;

    let sidePanelWidth = modelAppCacheSettings.oData.SIDEPANEL_WIDTH || sap.n.Launchpad.sidePanelWidth;
    const canvas = launchpadContent.getDomRef() && launchpadContent.getDomRef().offsetWidth || 0;
    const menuWidth = +launchpadContentMenu.getWidth().replace("px", "");
    const navWidth = +launchpadContentNavigator.getWidth().replace("px", "");
    const sideLimit = canvas - menuWidth - navWidth - sap.n.Launchpad.sidePanelContentLimit;

    let sideWidth = +sidePanelWidth.replace("px", "");

    if (sideLimit - sap.n.Launchpad.sidePanelContentLimit < 0) {
        diaSidepanel.addContent(AppCachePageSideTab);
        diaSidepanel.open();
        return;
    }

    AppCachePageSideApp.addContent(AppCachePageSideTab);

    if (sideWidth > sideLimit) {
        sideWidth = sideLimit;
        sidePanelWidth = sideWidth + "px";
    }

    const pattern = /^\d+$/;
    if (!pattern.test(+sidePanelWidth.substr(0, 1))) {
        sidePanelWidth = sap.n.Launchpad.sidePanelWidth;
    }
    modelAppCacheSettings.oData.SIDEPANEL_WIDTH = sidePanelWidth;
    setCacheAppCacheSettings();

    launchpadContentSideApp.setWidth(sidePanelWidth);
    sap.n.Launchpad.setLaunchpadContentWidth();

    setTimeout(() => {
        sap.n.Display.flex(launchpadContentSideApp);

        let mainDomRef;

        sap.ui.require([
            "sap/ui/thirdparty/jqueryui/jquery-ui-draggable"
        ], function() {
            $("#launchpadContentSideDrag").draggable({
                axis: "x",
                start: (event, ui) => {

                    mainDomRef = launchpadContentMain.getDomRef();

                    const menuWidth = launchpadContentMenu.getDomRef() && launchpadContentMenu.getDomRef().offsetWidth || 0;
                    const navWidth = launchpadContentNavigator.getDomRef() && launchpadContentNavigator.getDomRef().offsetWidth || 0;

                    sap.n.Launchpad.sideDrag = {
                        right: +mainDomRef.style.right.replace("px",""),
                        width: +launchpadContentSideApp.getWidth().replace("px", ""),
                        contentLimit: menuWidth + navWidth + sap.n.Launchpad.sidePanelContentLimit,
                    };
                },
                drag: (event, ui) => {

                    const shift = ui.position.left;
                    const left = ui.offset.left;
                    if (left < sap.n.Launchpad.sideDrag.contentLimit) {
                        return false;
                    }
                    const right = sap.n.Launchpad.sideDrag.right - shift;
                    const width = sap.n.Launchpad.sideDrag.width - shift;

                    if (width < sap.n.Launchpad.sidePanelAppLimit) {
                        return false;
                    }

                    mainDomRef.style.right = right + "px";
                    launchpadContentSideApp.setWidth(width + "px");
                },
                stop: (event, ui) => {

                    modelAppCacheSettings.oData.SIDEPANEL_WIDTH = launchpadContentSideApp.getWidth();
                    setCacheAppCacheSettings();

                    neptune.Utils.userDefault.update({
                        AREA: "LAUNCHPAD",
                        GROUPING: "LAYOUT_SIDEPANEL",
                        NAME: AppCache.CurrentConfig,
                        KEY0: "Width",
                        VAL0: modelAppCacheSettings.oData.SIDEPANEL_WIDTH
                    });
                }
            });
        }.bind(this));

    }, 50);
};

sap.n.Launchpad.showNavBar = () => {
    return sap.n.Layout.activeAppsSide();
};

sap.n.Launchpad.checkSidepanelWidth = () => {

    if (launchpadContentSideApp.getWidth() === "0px") return;

    const canvas = launchpadContent.getDomRef() && launchpadContent.getDomRef().offsetWidth || 0;
    const menuWidth = launchpadContentMenu.getDomRef() && launchpadContentMenu.getDomRef().offsetWidth || 0;
    const navWidth = launchpadContentNavigator.getDomRef() && launchpadContentNavigator.getDomRef().offsetWidth || 0;
    const usableWidth = canvas - menuWidth - navWidth;
    const maxSideWidth = usableWidth / 2;

    const sidePanelwidth = +launchpadContentSideApp.getWidth().replace("px", "");
    const sideLimit = canvas - menuWidth - navWidth - sap.n.Launchpad.sidePanelContentLimit - sap.n.Launchpad.sidePanelContentLimit;

    const mainDomRef = launchpadContentMain.getDomRef();

    if (sideLimit <= 0) {
        launchpadContentSideApp.setWidth("0px");
        sap.n.Display.none(launchpadContentSideApp);
        sap.n.Launchpad.setLaunchpadContentWidth();
        return;
    }

    if (sidePanelwidth > maxSideWidth) {
        launchpadContentSideApp.setWidth(maxSideWidth + "px");
        mainDomRef.style.right = maxSideWidth + "px";
    }
}

sap.n.Launchpad.sidepanelMinimize = () => {};

sap.n.Launchpad.sidepanelClose = () => {
    if (diaSidepanel.isOpen()) {
        diaSidepanel.close();

    } else if (launchpadContentSideApp.getWidth() !== "0px") {
        sap.n.Display.none(launchpadContentSideApp);
        launchpadContentSideApp.setWidth("0px");
        sap.n.Launchpad.setLaunchpadContentWidth();
    }
};

sap.n.Launchpad.settingsMenuOpen = function () {
    launchpadSettingsContainer.setVisible(true);

    setTimeout(() => {
        if (launchpadSettingsContainer.getDomRef())
            launchpadSettingsContainer.getDomRef().style.width = "100%";
        if (launchpadSettings.getDomRef()) launchpadSettings.getDomRef().style.display = "flex";
        if (launchpadSettingsClickArea.getDomRef())
            launchpadSettingsClickArea.getDomRef().style.display = "block";

        setTimeout(() => {
            launchpadSettings.addStyleClass("nepLaunchpadMenuSettingsOpen");
            launchpadSettingsBtn.focus();
        }, 10);
    });

    if (sap.n.Customization.isJiggling()) {
        sap.n.Customization.stopJiggling();
    }

    if (sap.n.Customization.isDisabled()) {
        AppCacheUserActionCustomization.setVisible(false);
    } else {
        const { lockScreenChanges } = modelAppCacheDiaSettings.getData();
        AppCacheUserActionCustomization.setVisible(!lockScreenChanges);
    }
};

sap.n.Launchpad.settingsMenuClose = function () {
    launchpadSettings.removeStyleClass("nepLaunchpadMenuSettingsOpen");

    if (launchpadSettingsContainer.getDomRef())
        launchpadSettingsContainer.getDomRef().style.width = "0";
    if (launchpadSettings.getDomRef()) launchpadSettings.getDomRef().style.display = "none";
    if (launchpadSettingsClickArea.getDomRef())
        launchpadSettingsClickArea.getDomRef().style.display = "none";

    launchpadSettingsContainer.setVisible(false);
};

sap.n.Launchpad.setOpenAppsExpanded = function () {
    openApps.setVisible(sap.n.Launchpad.openAppExpanded);
    openAppMaster.setIcon(
        `sap-icon://fa-solid/${sap.n.Launchpad.openAppExpanded ? "caret-down" : "caret-right"}`
    );
};

sap.n.Launchpad.setMenuActiveState = function () {
    ContentMenu.getItems().forEach(function (menu) {
        if (menu.getIcon()) {
            menu.addStyleClass("nepTreeItemAction");
        } else {
            menu.removeStyleClass("nepTreeItemAction");
        }
    });
};

sap.n.Launchpad.handleTreeNavigation = function (selectedItem) {
    const context = selectedItem.getBindingContext();
    const data = context.getObject();

    let dataTile, dataCat, pageCatId;

    switch (data.type) {
        case "tile":
            dataTile = ModelData.FindFirst(AppCacheTiles, "id", data.id);
            dataCat = ModelData.FindFirst(AppCacheCategory, "id", data.parent);
            if (!dataCat) dataCat = ModelData.FindFirst(AppCacheCategoryChild, "id", data.parent);
            sap.n.Launchpad.HandleTilePress(dataTile, dataCat);
            break;

        case "cat":
            dataCat = sap.n.Customization.getCategory(data.id);
            if (!dataCat) dataCat = ModelData.FindFirst(AppCacheCategoryChild, "id", data.id);
            sap.n.Launchpad.handleAppTitle(AppCache.launchpadTitle);
            location.hash = "neptopmenu&" + dataCat.id;
            sap.n.currentView = "";
            break;

        case "subcat":
            sap.n.Launchpad.handleAppTitle();
            dataCat = ModelData.FindFirst(AppCacheCategory, "id", data.parent);
            if (!dataCat) dataCat = ModelData.FindFirst(AppCacheCategoryChild, "id", data.parent);
            sap.n.Launchpad.handleAppTitle(dataCat.title);

            sap.n.currentView = "";

            if (sap.n.Launchpad.currentTileGroupPage !== `page${dataCat.id}`) {
                sap.n.Launchpad.BuildTiles(dataCat, data.id);
            } else {
                if (
                    typeof sap.n.Launchpad.currentTile === "object" &&
                    Object.keys(sap.n.Launchpad.currentTile).length > 0
                )
                    AppCache.Back();
                sap.n.Launchpad.scrollToTileGroup(data.id);
            }
            break;
    }

    if (!AppCache.config.verticalMenu) {
        sap.n.Launchpad.overflowMenuClose();
    }
};

sap.n.Launchpad.setSearchVisibility = () => {

    if (AppCache.isRestricted) {
        layoutDummySearch.setVisible(false);
        AppCacheShellSearch.setVisible(false);
        return;
    }

    const topWidth = +$("#toolTopMenu").width();
    const appsWidth = +$("#topCenterApps").width();
    const rightWidth = +$("#topContainerRight").width();
    const searchBtnWidth = +$("#AppCacheShellSearch").width();
    const rightTopWidth = appsWidth + rightWidth - searchBtnWidth;

    const appTitleWidth = +$("#AppCacheShellAppTitle-inner").outerWidth(true);
    const customLeftWidth = +$("#AppCacheShellCustomLeft").outerWidth(true);
    const containerLeftWidth = +$("#topContainerLeft").width();
    let topContentWidth = containerLeftWidth + appTitleWidth + customLeftWidth;
    if (rightTopWidth > topContentWidth) topContentWidth = rightTopWidth;

    const roomEnough = ((topWidth - 2 * topContentWidth) > 320);

    if (neptune.debug.menu) console.log("roomEnough: " + roomEnough + ", " + topWidth + ", " + topContentWidth);
    layoutDummySearch.setVisible(roomEnough);
    AppCacheShellSearch.setVisible(!roomEnough);
};

sap.n.Launchpad.setOpenAppsVisibility = (width) => {

    if (neptune.debug.header) console.log("sap.n.Launchpad.setOpenAppsVisibility: " + width);
    if (AppCache.openAppsHeader) {
        AppCacheShellOpenApps.setVisible(width >= sap.n.Launchpad.openAppsLimit);
    }
};

sap.n.Launchpad.setTopWidth = (id) => {

    if (neptune.debug.header) console.log("sap.n.Launchpad.setTopWidth: " + id);

    popOverflow.close();

    let btnWidth = $("#AppCacheMenuOverflowBtn").outerWidth(true) || 0;
    let totalWidth = 0;
    const topWidth = +$("#toolTopMenu").width();
    if (topWidth === null) return;

    const screenMenuWidth = +$("#screenMenu").width();
    if (neptune.debug.header) console.log("screenMenu width: " + screenMenuWidth);

    // Visbile Menus
    AppCacheAppButton.getItems().forEach(item => {
        const domItem = $("#" + item.getId());
        const width = domItem.outerWidth(true);
        btnWidth += width;
    });
    // Hidden Menus
    totalWidth = btnWidth;
    menuHidden.getItems().forEach(item => {
        const domItem = $("#" + item.getId());
        const width = domItem.outerWidth(true);
        totalWidth += width;
    });

    if (totalWidth < screenMenuWidth) {

        btnHidden.addItem(AppCacheMenuOverflowBtn);
        AppCacheMenuOverflowBtn.setVisible(false);

        const hiddenItems = menuHidden.getItems().length;
        for (let i = hiddenItems; i > 0; i--) {
            AppCacheAppButton.addItem(menuHidden.getItems()[i - 1]);
        }
        return;
    }

    AppCacheMenuOverflowBtn.setVisible(true);
    AppCacheMenuOverflow.addItem(AppCacheMenuOverflowBtn);
    const btnOverflowWidth = $("#AppCacheMenuOverflowBtn").outerWidth(true);

    btnWidth += btnOverflowWidth;

    if (btnWidth >= screenMenuWidth) {

        const visibleMenuItems = AppCacheAppButton.getItems().length;
        for (let j = visibleMenuItems; j > 0; j--) {

            const menuItemToHide = AppCacheAppButton.getItems()[j - 1];

            menuHidden.addItem(menuItemToHide);

            const domMenuItemToHide = $("#" + menuItemToHide.getId());
            const domMenuItemToHideWidth = domMenuItemToHide.outerWidth(true);
            btnWidth -= domMenuItemToHideWidth;

            if (btnWidth < screenMenuWidth) {
                break;
            }
        }

    } else {
        const hiddenMenus = menuHidden.getItems().length;
        for (let k = hiddenMenus; k > 0; k--) {

            const hiddenMenuItem = menuHidden.getItems()[k - 1];

            const domMenuItem = $("#" + hiddenMenuItem.getId());
            const domMenuItemWidth = domMenuItem.outerWidth(true);
            btnWidth += domMenuItemWidth;

            if (btnWidth >= screenMenuWidth) {
                break;
            }
            AppCacheAppButton.addItem(menuHidden.getItems()[k - 1]);
        }
    }
};

sap.n.Launchpad.setOpenAppsVisibility = (width) => {
    if (sap.n.Layout.activeAppsTop()) {
        AppCacheShellOpenApps.setVisible(width >= sap.n.Launchpad.openAppsLimit);
    }
};

sap.n.Launchpad.setCanvasClass = (width) => {
    if (!AppCache.cssGridBreakpoints) {
        if (neptune.ui.debug) console.warn("AppCache.cssGridBreakpoints not defined!");
        return;
    }

    document.documentElement.classList.remove("nepXSmall","nepSmall","nepMedium","nepLarge","nepXLarge","nepXXLarge","nepXXXLarge");

    if (width < AppCache.cssGridBreakpoints.xsmall) document.documentElement.classList.add("nepXSmall");
    else if (width < AppCache.cssGridBreakpoints.small) document.documentElement.classList.add("nepSmall");
    else if (width < AppCache.cssGridBreakpoints.medium) document.documentElement.classList.add("nepMedium");
    else if (width < AppCache.cssGridBreakpoints.large) document.documentElement.classList.add("nepLarge");
    else if (width < AppCache.cssGridBreakpoints.xlarge) document.documentElement.classList.add("nepXLarge");
    else if (width < AppCache.cssGridBreakpoints.xxlarge) document.documentElement.classList.add("nepXXLarge");
    else if (width < AppCache.cssGridBreakpoints.xxxlarge) document.documentElement.classList.add("nepXXXLarge");
};

sap.n.Launchpad.setContentNavigatorWidth = (size) => {
    launchpadContentNavigator.setWidth(size);
    iconPinOpenApps.setVisible(size !== "0px");

    if (size !== "0px") {
        navBarContainer.removeStyleClass("nepNoBorder");
        launchpadContentNavigator.removeStyleClass("nepHideMouseOver");
    } else {
        navBarContainer.addStyleClass("nepNoBorder");
        launchpadContentNavigator.addStyleClass("nepHideMouseOver");
    }
};

sap.n.Launchpad.setContentMenuWidth = (size) => {

    launchpadContentMenu.setWidth(size);
    launchpadContentMenu.setVisible(size !== "0px");
    if (size !== "0px") {
        launchpadContentMenu.removeStyleClass("nepNoBorder");
    } else {
        launchpadContentMenu.addStyleClass("nepNoBorder");
    }
};

sap.n.Launchpad.setPersonalization = () => {

    neptune.Utils.userDefault.read({
        AREA: "LAUNCHPAD",
        GROUPING: "LAYOUT_SIDEPANEL",
        NAME: AppCache.CurrentConfig,
    }, function(data) {
        if (typeof data === "undefined" || !data) data = {};
        if (!!data?.VAL0) {
            modelAppCacheSettings.oData.SIDEPANEL_WIDTH = data.VAL0;
            setCacheAppCacheSettings();
        }
    });

    modelAppCacheSplitView.setData([]);
    neptune.Utils.userDefault.read({
        AREA: "LAUNCHPAD",
        GROUPING: "SPLITVIEW_OPTIONS",
        NAME: AppCache.CurrentConfig,
    }, function(data) {
        sap.n.Launchpad.Splitview.saveCreate = (!!data?.BOL0) ? true : false;
        sap.n.Launchpad.Splitview.fullscreen = (!!data?.BOL1) ? true : false;
        sap.n.Launchpad.Splitview.orientation = (!!data?.VAL0) ? data.VAL0 : "Horizontal";
    });
};

sap.n.Launchpad.overflowMenuClose = function () {
    if (pageVerticalMenu.getParent().getId() !== "launchpadOverflow") {
        return;
    }
    launchpadOverflow.removeStyleClass("nepLaunchpadMenuOverflowOpen");

    if (launchpadOverflowContainer.getDomRef())
        launchpadOverflowContainer.getDomRef().style.width = "0";
    if (launchpadOverflowClickArea.getDomRef())
        launchpadOverflowClickArea.getDomRef().style.display = "none";

    launchpadOverflowContainer.setVisible(false);
    pageVerticalMenu.setVisible(false);
    btnVerticalMenuDummy.setVisible(false);
};

sap.n.Launchpad.overflowMenuOpen = function () {};

sap.n.Launchpad.setLaunchpadContentWidth = () => {

    const menuWidth = +launchpadContentMenu.getWidth().replace("px", "");
    const navWidth = +launchpadContentNavigator.getWidth().replace("px", "");
    const rightWidth = +launchpadContentSideApp.getWidth().replace("px", "");

    let left = (menuWidth + navWidth) + "px";
    let right = rightWidth + "px";

    if (document.documentElement.dir === "rtl") {
        const l = left;
        left = right;
        right = l;
    }

    const container = navBarContainer.getDomRef();
    if (container) {
        container.role = "region";
        container.ariaLabel = AppCache_tNavAriaLabel.getText();
    }
    const mainDomRef = launchpadContentMain.getDomRef();
    if (!!mainDomRef) {
        mainDomRef.style.left = left;
        mainDomRef.style.right = right;
        mainDomRef.style.width = "auto";
    }
};

sap.n.Launchpad.setAppWidthLimited = (limit) => {
    if (AppCache.isRestricted) {
        limit = false;
    }
    AppCacheShellUI.setAppWidthLimited(limit || false);
};

sap.n.Launchpad.setHeaderWidth = (layout) => {

    const _handle = (elem) => {
        elem.removeStyleClass("nepHeaderXXXLarge");
        elem.removeStyleClass("nepHeaderXXLarge");
        elem.removeStyleClass("nepHeaderXLarge");
        elem.removeStyleClass("nepHeaderLarge");
        elem.removeStyleClass("nepHeaderMedium");
        elem.removeStyleClass("nepHeaderSmall");
        elem.removeStyleClass("nepHeaderXSmall");

        if (!layout.HEADER_WIDTH) {
            elem.addStyleClass("nepHeaderLarge");
        } else {
            elem.addStyleClass("nepHeader" + layout.HEADER_WIDTH);
        }
    };
    _handle(toolTopMenu);
    _handle(topCenterMenu);
};

sap.n.Launchpad.setShellWidth = () => {

    if (!AppCache.CurrentLayout) return;

    AppCacheShellUI.removeStyleClass("nepShellFull");
    AppCacheShellUI.removeStyleClass("nepShellXXXLarge");
    AppCacheShellUI.removeStyleClass("nepShellXXLarge");
    AppCacheShellUI.removeStyleClass("nepShellXLarge");
    AppCacheShellUI.removeStyleClass("nepShellLarge");
    AppCacheShellUI.removeStyleClass("nepShellMedium");
    AppCacheShellUI.removeStyleClass("nepShellSmall");
    AppCacheShellUI.removeStyleClass("nepShellXSmall");

    if (AppCacheNav.getCurrentPage().getId().indexOf("__nepScreen") < 0 && !AppCache.CurrentLayout.SHELL_WIDTH_APP) {
        AppCacheShellUI.addStyleClass("nepShellLarge");
    } else if (AppCache.CurrentLayout.SHELL_WIDTH) {
        AppCacheShellUI.addStyleClass("nepShell" + AppCache.CurrentLayout.SHELL_WIDTH);
    }
};

sap.n.Launchpad.setTileContentObject = (guid) => {
    if (!sap.n.Launchpad.tileContent[guid]) {
        sap.n.Launchpad.tileContent[guid] = {
            title: [],
            info: [],
            abbreviation: [],
            footer: [],
            icon: [],
            iconImage: [],
            chart: [],
            integrationCard: [],
            cardHeader: [],
            cardNumericHeader: [],
            cardFooter: [],
            cardImage: [],
            nav: [],
            state: [],
            eventListeners: []
        };
    }
};

sap.n.Launchpad.setTilegroupContentObject = (guid) => {
    if (!sap.n.Launchpad.tilegroupContent[guid]) {
        sap.n.Launchpad.tilegroupContent[guid] = {
            feeds: []
        };
    }
};

sap.n.Launchpad.setInitialGridWidth = function (grid) {
    let navWidth = getWidth(elById("AppCacheNav"));

    let c = "";
    if (navWidth < 380) c = "nepGridXSmall";
    else if (navWidth < 680) c = "nepGridSmall";
    else if (navWidth < 980) c = "nepGridMedium";
    else if (navWidth < 1280) c = "nepGridLarge";
    else if (navWidth < 1580) c = "nepGridXLarge";
    else if (navWidth < 1880) c = "nepGridXXLarge";
    else if (navWidth < 2360) c = "nepGridXXXLarge";

    grid.addStyleClass(c);
};

sap.n.Launchpad.setUserLanguage = function (language = "EN") {
    setLaunchpadLanguage(language);

    let newLanguage = "EN";
    if (this.isLanguageValid(language)) {
        newLanguage = language.trim().toUpperCase();
        AppCache.userInfo.language = newLanguage;
    }

    const reloadApps = [];
    AppCache._loadedApps.forEach((options, value) => {
        reloadApps.push({ value, options });
    });
    AppCache._loadedApps.clear();

    const rebuildViews = [];
    AppCache._builtViews.forEach((args, id) => {
        const { viewName, applid, loadOptions } = args;
        loadOptions.defaultLanguage = newLanguage;
        rebuildViews.push({
            id,
            viewName: replaceLanguageInAppViewName(viewName, newLanguage),
            applid,
            loadOptions,
        });
    });
    AppCache._builtViews.clear();

    function loadApps(apps) {
        apps.forEach(({ value, options }) => {
            AppCache.Load(value, options);
        });
    }

    function rebuildAppViews(openAppIds, apps) {
        const activeApps = apps.filter(({ id }) => openAppIds.some((sId) => sId.includes(id)));
        if (activeApps.length === 0) return;

        // re-open apps that were open
        activeApps.forEach(({ viewName, applid, loadOptions }) => {
            AppCache.buildView({ viewName, applid, loadOptions });
        });
    }

    sap.n.Planet9.function({
        id: dataSet,
        method: "UpdateUserDetails",
        data: { language: newLanguage },
        success: () => {
            if (!supportsInlineTranslations()) {
                if (AppCache.isMobile) {
                    AppCache.translate(newLanguage);
                    sap.n.Launchpad.RebuildTiles();
                    sap.n.Launchpad.BuildMenuTop();
                    sap.n.Launchpad.BuildTreeMenu();
                    return;
                }

                // remove ?lang=, otherwise reload will show the language set in ?lang= parameter
                if (new URL(location.href).searchParams.has("lang")) {
                    const newUrl = new URL(location.href);
                    newUrl.searchParams.delete("lang");
                    history.pushState({}, document.title, newUrl);
                    location.reload();
                    return;
                }

                location.reload();
                return;
            }

            // support inline translations >= 24-LTS
            const openAppIds = openApps.getItems().map((item) => item.sId);
            AppCacheNav.getPages()
                .filter((page) => page.sId.indexOf("page") > -1)
                .forEach((page) => {
                    page.destroyContent();
                });

            AppCache.translate(newLanguage);

            sap.n.Launchpad.BuildMenu(false);
            sap.n.Launchpad.RebuildTiles();
            sap.n.Launchpad.BuildMenuTop();
            sap.n.Launchpad.BuildTreeMenu();

            // destroy existing apps that open
            rebuildViews.forEach(({ id }) => {
                sap.n.Shell.closeTile({ id });
            });

            // load/fetch apps with a different language
            loadApps(reloadApps);

            const viewIds = rebuildViews.map(({ id }) => id);
            function ensureViewsAvailabilityBeforeRebuildingActiveViews(
                viewIds,
                retryCount,
                callback
            ) {
                // no views asked to be checked, so we assume all views are available
                if (!Array.isArray(viewIds) || viewIds.length === 0) return callback(true);
                if (retryCount <= 0) return callback(false);

                if (!viewIds.every((viewId) => typeof AppCache.View[viewId] !== "undefined")) {
                    setTimeout(
                        () =>
                            ensureViewsAvailabilityBeforeRebuildingActiveViews(
                                viewIds,
                                retryCount - 1,
                                callback
                            ),
                        5
                    );
                    return;
                }

                callback(true);
            }

            // we wait for 5 seconds, before giving up on views being available
            ensureViewsAvailabilityBeforeRebuildingActiveViews(viewIds, 1000, (available) => {
                if (!available) return;
                setTimeout(() => rebuildAppViews(openAppIds, rebuildViews), 100);
            });
        },
    });
};

sap.n.Launchpad.isLanguageValid = function (language) {
    return masterLanguages.map(({ ISOCODE }) => ISOCODE).includes(language);
};

sap.n.Launchpad.applyLanguages = function (languages) {
    inAppCacheFormSettingsLang.setVisible(true);
    inAppCacheFormSettingsLang.destroyItems();

    inAppCacheFormSettingsLang.addItem(new sap.ui.core.ListItem({ key: "", text: "" }));
    masterLanguages.forEach(function ({ ISOCODE: key, NAME: text }) {
        if (languages.includes(key)) {
            inAppCacheFormSettingsLang.addItem(new sap.ui.core.ListItem({ key, text }));
        }
    });
};

sap.n.Launchpad.scrollToTileGroup = function (tileGroupId) {
    setTimeout(function () {
        const elm = querySelector(`#${sectionPrefix()}${tileGroupId}`);
        if (elm && elm.scrollIntoView) {
            elm.scrollIntoView();
        }
    }, 500);
};

sap.n.Launchpad.SelectHomeMenu = function () {
    // Start with hash
    if (location.hash) {
        sap.n.HashNavigation._handler();
    } else {
        const category = sap.n.Customization.getCategories()[0];
        if (category) location.hash = "neptopmenu&" + category.id;
    }
};

sap.n.Launchpad.SetHeader = function () {
    if (sap.n.Launchpad.currentTile) {
        sap.n.Launchpad.setActiveIcon(sap.n.Launchpad.currentTile.id);
    } else {
        sap.n.Launchpad.setActiveIcon();
    }
};

sap.n.Launchpad.MarkTopMenu = function (menuID) {
    const activeId = `${nepPrefix()}${menuID}`;
    AppCacheAppButton.getItems().forEach(function (item) {
        if (item.removeStyleClass && item.sId !== activeId)
            item.removeStyleClass("nepTopMenuActive");
        if (item.sId === activeId) item.addStyleClass("nepTopMenuActive");
    });
};

sap.n.Launchpad.GetGroupCards = function (data, type, dragDropContext) {
    const cards = new sap.m.FlexBox(nepId(), {
        renderType: "Bare",
    }).addStyleClass("nepGrid");
    if (data.styleClass) cards.addStyleClass(data.styleClass);

    // use Neptune Element Query to determine dynamic page width
    neptune.ElementQuery.register(cards, {
        prefix: "nepGrid",
        isolate: true,
        width: AppCache.cssGridBreakpoints,
    });

    sap.n.Launchpad.setInitialGridWidth(cards);

    // Content Width
    if (data.cardContentWidth) {
        cards.addStyleClass("nepGroup" + data.cardContentWidth);
    }

    // Content Alignment
    let cardContentAlign = sap.n.Launchpad.currLayoutContent.cardContentAlign || "Center";
    if (data.cardContentAlign) cardContentAlign = data.cardContentAlign;
    if (cardContentAlign) {
        cards.addStyleClass("nepGridAlign" + cardContentAlign);
    }

    function applyTileGroupEnhancement() {
        if (sap.n.Enhancement.AfterTileGroupRenderer) {
            try {
                sap.n.Enhancement.AfterTileGroupRenderer(cards, data);
            } catch (e) {
                appCacheError("Enhancement AfterTileGroupRenderer " + e);
            }
        }
    }

    cards.onAfterRendering = function () {
        applyTileGroupEnhancement();
    };

    return cards;
};

sap.n.Launchpad.getIconUrl = function (dataTile) {
    if (dataTile.icon) return dataTile.icon;

    if (dataTile.actionType === "F") return "sap-icon://chart-table-view";
    else if (dataTile.actionApplication) return "sap-icon://nep/app";

    return "sap-icon://chain-link";
};

sap.n.Launchpad.isMenuPage = function () {
    let id = AppCacheNav.getCurrentPage().sId;
    id = id.split("page")[1];

    if (id) {
        const dataCatChild = ModelData.FindFirst(AppCacheCategoryChild, "id", id);
        return dataCatChild ? false : true;
    }

    return false;
};

sap.n.Launchpad.setMenuPage = function (dataCat) {

    // Close Help
    AppCacheShellHelp.setVisible(false);
    sap.n.Shell.closeSidepanel();

    // Clear currentTile
    sap.n.Launchpad.currentTile = {};

    // Title
    sap.n.Launchpad.SetHeader();
};

sap.n.Launchpad.reCreateCurrentPage = function () {
    const current = AppCacheNav.getCurrentPage();
    const categoryId = current.sId.split("page")[1];

    const category = sap.n.Customization.getCategory(categoryId);

    this.destroyPage(current);
    if (category) sap.n.Launchpad.BuildTiles(category);
};

sap.n.Launchpad.destroyPage = function (page) {
    if (!page) return;

    AppCacheNav.removePage(page);
    page.destroy();
};

sap.n.Launchpad.saveFav = function () {

    // Update P9 DB with data
    sap.n.Planet9.function({
        id: dataSet,
        method: "SaveFav",
        data: {
            tiles: modelAppCacheFavorites.oData.FAVORITES,
            launchpad: AppCache.launchpadID,
        },
    });
};

sap.n.Launchpad.setHideHeader = function (hideHeader) {
    if (AppCache.config && AppCache.config.hideTopHeader) return;
    topMenu.setHeight(hideHeader ? "0px" : "48px");
};

sap.n.Launchpad.setHideTopButtons = function (hide) {
    AppCacheShellUserName.setVisible(!hide);
    if (hide) {
        if (!AppCache.StartApp && !AppCache.StartWebApp) AppCacheShellMenuOverflow.setVisible(!hide);
    } else {
        if (!AppCache.StartApp && !AppCache.StartWebApp) AppCacheShellMenuOverflow.setVisible(hide);
    }
};

sap.n.Launchpad.setActiveIcon = (sId) => {

    if (sap.n.Layout.activeAppsTop()) {

        AppCacheShellOpenApps.getItems().forEach(item => {
            item.removeStyleClass("nepTopMenuActive");
        });
        const tileButton = sap.ui.getCore().byId(sId);
        if (tileButton) {
            tileButton.addStyleClass("nepTopMenuActive");
        }
    } else {

        let overflow;
        let active = -1;

        navBarContent.getItems().forEach((data, i) => {
            data.removeStyleClass("nepIconActivePrevious");
            data.removeStyleClass("nepIconActive");
            overflow = sap.ui.getCore().byId(data.sId + "-overflow");
            if (overflow) overflow.removeStyleClass("nepIconActive");

            if (data.sId === sId) {
                data.addStyleClass("nepIconActive");
                overflow = sap.ui.getCore().byId(data.sId + "-overflow");
                if (overflow) overflow.addStyleClass("nepIconActive");
                active = i;
            }
        });
        if (active > 0) {
            navBarContent.getItems()[active - 1].addStyleClass("nepIconActivePrevious");
        }
    }
};

sap.n.Launchpad.getPageTitle = function (dataCat) {
    if (dataCat.isCustom) {
        return [dataCat.props.title, dataCat.props.subTitle];
    }

    return [
        sap.n.Launchpad.translateTile("title", dataCat),
        dataCat.subTitle ? sap.n.Launchpad.translateTile("subTitle", dataCat) : "",
    ];
};

sap.n.Launchpad.buildGroupMessage = function (dataCat) {
    const msgStrip = new sap.m.MessageStrip(nepId(), {
        type: dataCat.configMessage.type || "None",
        text: dataCat.configMessage.text || "",
        showIcon: dataCat.configMessage.showIcon || false,
        customIcon: dataCat.configMessage.icon || "",
        showCloseButton: dataCat.configMessage.showCloseButton || false,
        enableFormattedText: true,
    });

    const messageBox = new sap.m.VBox(nepId(), {
        renderType: "Bare",
    }).addStyleClass("nepGroupHeaderMessage");
    messageBox.addItem(msgStrip);
    return messageBox;
};

sap.n.Launchpad.buildTileSubHeader = function (dataTile, tileWidth, dataCat) {
    let oBlockCell = new sap.ui.layout.BlockLayoutCell(nepId(), {
        width: tileWidth,
        title: sap.n.Launchpad.translateTile("title", dataTile),
        titleAlignment: dataTile.titleAlignment || "Begin",
    });

    if (dataTile.image) {
        let imageUrl;
        let inlineStyle = new sap.ui.core.HTML(nepId());

        if (AppCache.isMobile) {
            imageUrl = dataTile.imageData;
        } else {
            imageUrl = dataTile.image.startsWith("http")
                ? dataTile.image
                : `${AppCache.Url}${dataTile.image}`;
        }

        inlineStyle.setDOMContent(`
                <style>
                .tileImage${dataTile.id} {
                    background-image: url('${imageUrl}');
                    background-size: 100% auto;
                    background-position: 0 80%;
                }
                </style>
            `);

        oBlockCell.addStyleClass("tileImage" + dataTile.id);
        oBlockCell.addContent(inlineStyle);
    }

    let oHeaderInfoText = new sap.m.Text(nepId(), {
        textAlign: "Begin",
        width: "100%",
        text: sap.n.Launchpad.translateTile("subTitle", dataTile),
    });
    oBlockCell.addContent(oHeaderInfoText);

    return oBlockCell;
};

// device = mobile, tablet or desktop
sap.n.Launchpad.getTileGroupHeaderBackgroundCSS = function (dataCat, device) {
    let url;
    let position,
        defaultPosition = "center center";
    let size,
        defaultSize = "cover";
    let repeat,
        defaultRepeat = "no-repeat";
    let height,
        defaultHeight = "82px";

    if (device === "mobile") {
        url = dataCat.imageMobile;
        position = dataCat.imageMobilePlacement;
        size = dataCat.imageMobileSize;
        repeat = dataCat.imageMobileRepeat;
        height = dataCat.imageMobileHeight;
    } else if (device === "tablet") {
        url = dataCat.imageTablet;
        position = dataCat.imageTabletPlacement;
        size = dataCat.imageTabletSize;
        repeat = dataCat.imageTabletRepeat;
        height = dataCat.imageTabletHeight;
    } else if (device === "desktop") {
        url = dataCat.image;
        position = dataCat.imagePlacement;
        size = dataCat.imageSize;
        repeat = dataCat.imageRepeat;
        height = dataCat.imageHeight;
    }

    const bgImg = url.startsWith("http") ? url : `${AppCache.Url}${url}`;
    if (url) {
        let id = `nepCatHeader${dataCat.id}`;
        lazyLoadTileImage(bgImg, `.${id} .sapMPanelContent`, "style");
    }

    return `
            height: ${height || defaultHeight} !important;
            background-repeat: ${repeat || defaultRepeat};
            background-position: ${position || defaultPosition};
            background-size: ${size || defaultSize};
        `;
};

sap.n.Launchpad.buildTileDefault = function (dataTile, tileWidth, dataCat, isMostUsed) {
    // Top
    let oBlockCell = new sap.ui.layout.BlockLayoutCell(nepId(), {
        title: sap.n.Launchpad.translateTile("title", dataTile),
        titleAlignment: dataTile.titleAlignment || "Begin",
        titleLevel: dataTile.titleLevel || "Auto",
        width: tileWidth,
    }).addStyleClass("nepTile");

    let oBlockContentParent = new sap.m.VBox(nepId(), {
        justifyContent: "SpaceBetween",
        height: "calc(100% - 25px)",
        renderType: "Bare",
    });

    let oBlockContentTop = new sap.m.VBox(nepId(), {
        renderType: "Bare",
    });

    oBlockCell.addContent(oBlockContentParent);
    oBlockContentParent.addItem(oBlockContentTop);

    // SubTitle - Box
    let oBlockContent = new sap.m.HBox(nepId(), {
        width: "100%",
        justifyContent: "SpaceBetween",
        renderType: "Bare",
    });

    // Reverse if title at End
    if (dataTile.titleAlignment === "End") oBlockContent.setDirection("RowReverse");

    oBlockContent.addStyleClass("sapUiSmallMarginBottom");
    oBlockContentTop.addItem(oBlockContent);

    // SubTitle
    if (dataTile.subTitle) {
        let oBlockInfo = new sap.m.Text(nepId(), {
            text: sap.n.Launchpad.translateTile("subTitle", dataTile),
        });

        oBlockContent.addItem(oBlockInfo);
        oBlockInfo.addStyleClass("nepTileSubTitle");
    }

    if (dataTile.icon) {
        let oBlockIcon;
        if (dataTile.icon.indexOf("sap-icon") > -1) {
            oBlockIcon = new sap.ui.core.Icon(nepId(), {
                src: dataTile.icon,
                size: "1.5rem",
                useIconTooltip: false,
            });
        } else {
            oBlockIcon = new sap.m.Image(nepId(), {
                src: dataTile.icon,
                width: "38px",
                densityAware: false,
            });
        }

        if (dataTile.titleAlignment === "End") {
            oBlockIcon.addStyleClass("nepTileIconLeft");
        } else {
            oBlockIcon.addStyleClass("nepTileIconRight");
        }

        oBlockContent.addItem(oBlockIcon);
    }

    // With Description
    if (dataTile.type === "carddesc") {
        let textDescription = new sap.m.Text(nepId(), {
            text: sap.n.Launchpad.translateTile("description", dataTile),
        });
        textDescription.addStyleClass("nepTileDescription");
        oBlockContentTop.addItem(textDescription);
    }

    if (!isMostUsed) {
        // Image - background or image card
        if (dataTile.image) {
            let imageUrl;
            let inlineStyle = new sap.ui.core.HTML(nepId());

            if (AppCache.isMobile) {
                imageUrl = dataTile.imageData;
            } else {
                imageUrl = dataTile.image.startsWith("http")
                    ? dataTile.image
                    : `${AppCache.Url}${dataTile.image}`;
            }

            inlineStyle.setDOMContent(`
                    <style>
                    .tileImage${dataTile.id} {
                        background-image: url('${imageUrl}');
                        background-size: cover;
                        background-position: 0 80%;
                    }
                    </style>
                `);

            oBlockCell.addStyleClass("tileImage" + dataTile.id);
            oBlockCell.addContent(inlineStyle);
        }
    }

    // Actions
    sap.n.Launchpad.buildTileAction(dataTile, oBlockContentParent, oBlockCell, dataCat);
    return oBlockCell;
};

sap.n.Launchpad.translateTile = function (field, dataTile) {
    if (!dataTile) return;
    if (
        dataTile[field] === null ||
        dataTile[field] === "null" ||
        typeof dataTile[field] === "undefined"
    )
        return "";

    let text = dataTile[field];

    if (!dataTile.translation || dataTile.translation === "[]" || dataTile.translation.length === 0)
        return text;

    dataTile.translation.forEach(function (data) {
        if (data.language === getLaunchpadLanguage()) text = data[field];
    });

    return text;
};

sap.n.Launchpad.getHighchartData = function (dataTile, chart, pageId, chartId, init) {
    let url = dataTile.dataUrl;
    let querySep = "?";

    if (url.indexOf("http") === -1) url = AppCache.Url + url;

    // Add URL Query
    if (url.indexOf("?") > -1) querySep = "&";
    url = url + querySep + "init=" + init;

    request({
        type: "GET",
        contentType: "application/json",
        url: url,
        success: function (data) {
            if (!chart) return;
            if (!chart.series) return;

            // Save to cache
            localStorage.setItem("p9TileChart" + dataTile.id, JSON.stringify(data));

            // Only redraw chart when number of series changes.
            if (
                Array.isArray(data.series) &&
                Array.isArray(chart.series) &&
                chart.series.length !== data.series.length
            ) {
                Array.isArray(data.series) &&
                    data.series.forEach(function (serie) {
                        chart.addSeries(serie, false);
                    });
                chart.update(data);
                chart.redraw();
            } else {
                // Only update series values to get animation
                let seriesData = [];
                Array.isArray(data.series) &&
                    data.series.forEach(function (serie, i) {
                        chart.series[i].setData(serie.data);
                    });
            }
        },
        error: function (result, status) {
            if (sap.n.Launchpad.Timers[chartId])
                clearInterval(sap.n.Launchpad.Timers[chartId].timer);
        },
    });
};

sap.n.Launchpad.getHighstockData = function (dataTile, chart, pageId, chartId, init) {
    let url = dataTile.dataUrl;
    let querySep = "?";

    if (url.indexOf("http") === -1) url = AppCache.Url + url;

    // Add URL Query
    if (url.indexOf("?") > -1) querySep = "&";
    url = url + querySep + "init=" + init;

    request({
        type: "GET",
        contentType: "application/json",
        url: url,
        success: function (data) {
            if (!chart) return;
            if (!chart.series) return;

            // Only redraw chart when number of series changes.
            if (chart.series.length === 0) {
                data.series.forEach(function (serie) {
                    chart.addSeries(serie, false);
                });
                chart.update(data);
                chart.redraw();
            } else {
                // Only update series values to get animation
                let seriesData = [];
                data.series.forEach(function (serie, i) {
                    chart.series[i].addPoint(serie.data, true, true);
                });
            }
        },
        error: function (result, status) {
            if (sap.n.Launchpad.Timers[chartId])
                clearInterval(sap.n.Launchpad.Timers[chartId].timer);
        },
    });
};

sap.n.Launchpad.traceTile = function (dataTile) {
    if (!dataTile) return;
    let system = sap.n.Launchpad.deviceType();

    sap.n.Planet9.function({
        id: dataSet,
        method: "TraceTile",
        data: {
            tile: dataTile.id,
            launchpad: AppCache.launchpadID,
            browserName: sap.ui.Device.browser.name,
            browserVersion: sap.ui.Device.browser.version,
            osName: sap.ui.Device.os.name,
            osVersion: sap.ui.Device.os.version,
            system: system,
        },
    });
};

sap.n.Launchpad.deviceType = function () {
    const desktop = sap.ui.Device.system.desktop;
    const tablet = sap.ui.Device.system.tablet;
    const phone = sap.ui.Device.system.phone;

    const deviceDesktop = sap.n.Launchpad.device.DESKTOP;
    const deviceTablet = sap.n.Launchpad.device.TABLET;
    const devicePhone = sap.n.Launchpad.device.PHONE;

    if (desktop && tablet) {
        if (isCordova()) return deviceTablet;
        return deviceDesktop;
    }

    if (tablet && !isCordova()) return deviceDesktop;
    if (desktop) return deviceDesktop;
    if (tablet) return deviceTablet;
    if (phone) return devicePhone;

    return deviceDesktop;
};

(sap.n.Launchpad.isDesktop = function () {
    return sap.n.Launchpad.deviceType() === sap.n.Launchpad.device.DESKTOP;
}),
(sap.n.Launchpad.isTablet = function () {
    return sap.n.Launchpad.deviceType() === sap.n.Launchpad.device.TABLET;
}),
(sap.n.Launchpad.isPhone = function () {
    return sap.n.Launchpad.deviceType() === sap.n.Launchpad.device.PHONE;
});
