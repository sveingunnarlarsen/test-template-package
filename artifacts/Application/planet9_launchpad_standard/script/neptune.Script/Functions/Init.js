// Globals
let dataSet = 'Launchpad';
let currTiles = [];
let currCategory = [];
let currCategoryChild = [];
let deviceType;
let parentObject;
let searchCancelItemPress = false;
let navBarTimeout;
let screenSplit = 1300;

if (!!AppCache.globalStyle) {
    const elem = document.getElementById("globalStyle");
    elem.href = AppCache.globalStyle;
}

// e.g. during Azure refresh token, cookie-session get's updated. If any app or api call is made during this timeframe, it will log user out. refreshingAuth is a generic flag set to indicate when some auth change is in process.
let refreshingAuth = false;

// Get URL Parameters
let params = {};
if (location.search) {
    let parts = location.search.substring(1).split('&');
    for (let i = 0; i < parts.length; i++) {
        let nv = parts[i].split('=');
        if (!nv[0]) continue;
        params[nv[0]] = nv[1];
    }
}

// TNT Icons
sap.ui.core.IconPool.registerFont({
    collectionName: 'tnt',
    fontFamily: 'SAP-icons-TNT',
    fontURI: sap.ui.require.toUrl('sap/tnt/themes/base/fonts'),
    lazy: false
});

sap.ui.core.ResizeHandler.register(topMenu, function(e) {
    sap.n.Launchpad.setTopWidth("topMenu Resize");
    sap.n.GlobalSearch.close();
});

sap.ui.core.ResizeHandler.register(topCenterGap, function(e) {
    sap.n.Launchpad.setSearchVisibility(true);
});

sap.ui.Device.resize.attachHandler(function(mParams) {
    var setContentWidth = false;
    var setNavWidth = false;
    var menuWidth = +launchpadContentMenu.getWidth().replace("px", "");

    if (menuWidth > 0 && mParams.width < sap.n.Launchpad.verticalMenuLimit) {
        sap.n.Launchpad.setContentMenuWidth("0px");
        pageVerticalMenu.setVisible(false);
        setContentWidth = true;
    }
    if (sap.n.Launchpad.showNavBar() && navBarContent.getItems().length > 0) {

        var navWidth = +launchpadContentNavigator.getWidth().replace("px", "");

        if (navWidth === 0 && mParams.width > sap.n.Launchpad.navigationItemLimit) {
            launchpadContentNavigator.setWidth("68px");
            launchpadContentNavigator.removeStyleClass("nepHideMouseOver");
            setNavWidth = true;
        } else if (navWidth !== 0 && mParams.width < sap.n.Launchpad.navigationItemLimit) {
            launchpadContentNavigator.setWidth("0px");
            launchpadContentNavigator.addStyleClass("nepHideMouseOver");
            setNavWidth = true;
        }
        iconPinOpenApps.setVisible(launchpadContentNavigator.getWidth() !== "0px");
        if (setNavWidth) {
            setContentWidth = true;
        }
    }
    if (setContentWidth) {
        sap.n.Launchpad.setLaunchpadContentWidth();
        sap.n.Layout.setHeaderPadding();
    }
    sap.n.Launchpad.setOpenAppsVisibility(mParams.width);
    sap.n.Launchpad.setCanvasClass(mParams.width);

    sap.n.Launchpad.checkSidepanelWidth();
});

sap.ui.core.BusyIndicator.hide();

// Enhancement
if (params['getEnhancement'] === 'true') sap.n.Enhancement.getSpots();

// New IOS devices detected as Mac
if (isCordova() && sap.ui.Device.os.name === 'mac') sap.ui.Device.os.name === 'iOS';

// Load Library
try {
    [
        'sap.ui.core.format.DateFormat',
        'sap.ui.core.format.NumberFormat',
        'sap.ui.core.format.FileSizeFormat',
        'sap.m.MessageBox',
        "sap/ui/thirdparty/jqueryui/jquery-ui-core",
        "sap/ui/thirdparty/jqueryui/jquery-ui-mouse",
        "sap/ui/thirdparty/jqueryui/jquery-ui-widget",
        "sap/ui/thirdparty/jqueryui/jquery-ui-datepicker",
        "sap/ui/thirdparty/jqueryui/jquery-ui-sortable",
        "sap/ui/thirdparty/jqueryui/jquery-ui-resizable",
        "sap/ui/thirdparty/jqueryui/jquery-ui-draggable",
        "sap/ui/thirdparty/jqueryui/jquery-ui-droppable"
    ].forEach(function (name) {
        jQuery.sap.require(name);
    });
} catch (e) { }

// Hash Navigation - Clear topmenu/sections
if (isSection(location.hash)) location.hash = '';

// Detect URL Parameters 
if (params['isMobile'] === 'true') AppCache.isMobile = true;
if (params['mobileClient']) AppCache.mobileClient = params['mobileClient'];

// Add Check for Opera 
sap.ui.Device.browser.BROWSER.OPERA = "op";
if (navigator.userAgent.indexOf('Opera') > -1 || navigator.userAgent.indexOf('OPR') > -1) sap.ui.Device.browser.name = 'op';

// UI Settings Mobile/Desktop
if (sap.n.Launchpad.isPhone()) {
    AppCacheDiaSettings.setStretch(true);
    diaText.setStretch(true);
}

// Event When changing Theme
sap.ui.getCore().attachThemeChanged(function () {
    sap.n.Launchpad.afterTheme();
});

var _launchpadOverflowClickArea_delegate = {
    onclick: function(e) {
        sap.n.Launchpad.overflowMenuClose();
    }
};
launchpadOverflowClickArea.addEventDelegate(_launchpadOverflowClickArea_delegate);
launchpadOverflowClickArea.exit = function() {
    launchpadOverflowClickArea.removeEventDelegate(_launchpadOverflowClickArea_delegate);
};

var _launchpadSettingsClickArea_delegate = {
    onclick: function(e) {
        sap.n.Launchpad.settingsMenuClose();
    }
};
launchpadSettingsClickArea.addEventDelegate(_launchpadSettingsClickArea_delegate);
launchpadSettingsClickArea.exit = function() {
    launchpadSettingsClickArea.removeEventDelegate(_launchpadSettingsClickArea_delegate);
};

//AppCacheUserActionDummy
const _AppCacheUserActionDummy_delegate = {
    onfocusin: function(e) {
        launchpadSettingsBtn.focus();
    }
};
AppCacheUserActionDummy.addEventDelegate(_AppCacheUserActionDummy_delegate);
AppCacheUserActionDummy.exit = ()=>{
    AppCacheUserActionDummy.removeEventDelegate(_AppCacheUserActionDummy_delegate);
};

//btnVerticalMenuDummy
const _btnVerticalMenuDummy_delegate = {
    onfocusin: function(e) {
        if (launchpadOverflowContainer.getVisible()) {
            launchpadOverflowBtn.focus();
        }
    }
};
btnVerticalMenuDummy.addEventDelegate(_btnVerticalMenuDummy_delegate);
btnVerticalMenuDummy.exit = ()=>{
    btnVerticalMenuDummy.removeEventDelegate(_btnVerticalMenuDummy_delegate);
};

toolVerticalMenuFilter.onAfterRendering = function () {
    const input = toolVerticalMenuFilter.getInputElement();

    if (input) {
        const attr = input.getAttribute('placeholder');
        const placeholder = toolVerticalMenuFilter.getPlaceholder() || attr;
        input.setAttribute('title', placeholder);
        input.setAttribute('label', placeholder);
    }
    this.__proto__.onAfterRendering.apply(this);
}

AppCachePageSideTab.onAfterRendering = function () {
    const dom = this.getDomRef();

    if (dom) {
        const input = dom.getElementsByTagName('input')[0];
        if (input) {
            input.title = 'Side App Select';
        }
    }
    this.__proto__.onAfterRendering.apply(this);
}

AppCacheUsers.addEventDelegate({
    onAfterRendering: () => {
        if (AppCacheUsers.getItems().length) {
            AppCacheUsers.getItems()[0].focus();
        }
    }
});

window.addEventListener("click", function(event) {
    if (sap.n.GlobalSearch.isOpen()) {
        if (event.srcElement.id === 'sap-ui-blocklayer-popup') {
            sap.n.GlobalSearch.close();
        }
    }
});
if (sap.ui.Device.system.phone) {
    diaGlobalSearch.setStretch(true);
}

if (sap.ui.Device.support.touch) {
    diaGlobalSearch.setInitialFocus(btnGlobaleSearchClose);
} else {
    diaGlobalSearch.setInitialFocus(inGlobaleSearch);
}

applyWCAGFixes();

sap.n.Launchpad.setCanvasClass(sap.ui.Device.resize.width);

console.log(`R1 Init: ${modelAppCacheLayout?.oData?.layoutLight?.NAME} - ${modelAppCacheLayout?.oData?.layoutDark?.NAME}`);

// No user based cache objects here!
Promise.all([
    getCacheAppCacheLayout(true),
    getCacheAppCacheTileLayout(true),
    getCacheAppCacheGroupLayout(true),
    getCacheDataSettings(true),
]).then(() => {

    console.log("Initial cache...");
    console.log(`R3 After Cache: ${modelAppCacheLayout?.oData?.layoutLight?.NAME} - ${modelAppCacheLayout?.oData?.layoutDark?.NAME}`);

    if (!sap.n.Customization.isDisabled()) {
        sap.n.Customization.addCustomizableClass();
    }

    sap.n.Design.loadLayout();

    // Browser Title 
    if (AppCache.launchpadTitle && AppCache.launchpadTitle !== 'null') document.title = AppCache.launchpadTitle;

    // UI Settings w/StartApp
    if (AppCache.StartApp) AppCacheShellMenuOverflow.setVisible(false);

    // Sort Users
    AppCacheUsers.getBinding('items').sort(new sap.ui.model.Sorter('username', false, false))

    // Models 
    modelContentMenu.setSizeLimit(5000);

    // Config 
    if (AppCache.config) {
        const { config } = AppCache;
        if (sap.n.Layout.showActiveApps() && !config.verticalMenu && !config.enableTopMenu) {
            AppCache.config.verticalMenu = false;
            AppCache.config.enableTopMenu = true;
        }

        // Settings
        if (config.languages) {
            sap.n.Launchpad.applyLanguages(AppCache.config.languages);
        }

        if (config.hideTopHeader && !AppCache.isMobile) topMenu.setHeight('0px');
        if (config.hideLoginSelection) AppCache_loginTypes.setVisible(false);
        if (config.verticalMenu && sap.ui.Device.resize.width >= sap.n.Launchpad.verticalMenuLimit && !AppCache.isMobile) {
            sap.n.Launchpad.overflowMenuOpen();
        }

        // Enhancement
        if (config.enhancement) {
            try {
                eval(config.enhancement);
            } catch (e) {
                console.error(e);
            }
        }

        // Paths
        if (AppCache.config.ui5ModulePath) {
            ['sap.viz', 'sap.chart', 'sap.me', 'sap.ui.comp', 'sap.ushell', 'sap.ui.fl','sap.ui.commons', 'sap.ui.ux3', 'sap.suite.ui.microchart', 'sap.suite.ui.commons',
            ].forEach(function (name) {
                const path = AppCache.config.ui5ModulePath + '/' + name.replace(/\./g, '/');
                jQuery.sap.registerModulePath(name, path);
            });
        }
    }

    // Get Setting or Startup
    if (AppCache.isMobile) {
        if (!isPWAEnabled()) location.hash = '';

        AppCacheUserActionSettings.setVisible(false);
        AppCache.setSettings();
        AppCache.getSettings();

    } else {
        const { type } = getAuthSettingsForUser();
        AppCacheUserActionChangePassword.setVisible(!isOffline() && type === 'local' && !isChpassDisabled());
        AppCache.Startup();
    }

    if (AppCache.enablePasscode) {
        AppCache_boxPasscodeEntry.addEventDelegate({
            onkeyup: (evt) => {
                if (evt.key === 'Escape') {
                    AppCache.Lock();
                }
            },
        })
    }

    // Connect external Tools
    setTimeout(function () {
        AppCache.enableExternalTools();
    }, 500);

}).catch((err) => {
    console.error("Initial cache load failed", err);
});

setOpenUI5Version();

// we can wait for translations to load, since launchpad already renders in user's choosen translation
setTimeout(fetchTranslations, 100);

setTimeout(disableChpass, 2000);
setTimeout(setiOSPWAIcons, 2000);
setTimeout(setAccessibilityFocusIndicator, 100);

// Sorter Function
let sort_by = function (field, reverse, primer) {
    let key = primer ?
        function (x) {
            return primer(x[field])
        } :
        function (x) {
            return x[field]
        };
    reverse = !reverse ? 1 : -1;
    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
}
