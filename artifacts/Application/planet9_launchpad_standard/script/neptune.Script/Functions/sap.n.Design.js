sap.n.Design = {
    LastSeen: {
        layout: {
            system: 0,
            dedicated: "",
            light: "",
            dark: ""
        }
    }
};

sap.n.Design.LastSeen.setLayout = (layout)=>{
    sap.n.Design.LastSeen.layout = layout;
    localStorage.setItem(AppCache.CurrentConfig + "_LastSeenLayout", JSON.stringify(layout));
};

sap.n.Design.LastSeen.getLayout = ()=>{
    const layout = neptune.layout.lastSeenLayout(AppCache.CurrentConfig);
    if (layout) {
        sap.n.Design.LastSeen.layout = layout;
    }
    return layout;
};

sap.n.Design.LastSeen.update = (layout)=>{

    let refresh = false;

    if (AppCache.enableSystemTheme) {

        if (sap.n.Design.LastSeen.layout.system !== layout.system) {
            refresh = true;

        } else if (layout.system === sap.n.Launchpad.theme.system.light && sap.n.Design.LastSeen.layout.light !== layout.light) {
            refresh = true;

        } else if (layout.system === sap.n.Launchpad.theme.system.dark && sap.n.Design.LastSeen.layout.dark !== layout.dark) {
            refresh = true;
        }

    } else if (sap.n.Design.LastSeen.layout.dedicated !== layout.dedicated) {
        refresh = true;
    }

    sap.n.Design.LastSeen.setLayout(layout);

    if (refresh) {
        sap.n.Design.loadLayout();
    }
};

sap.n.Design.LastSeen.updateDedicated = (dedicated)=>{
    let refresh = false;
    if (!AppCache.enableSystemTheme && sap.n.Design.LastSeen.layout.dedicated !== dedicated) {
        refresh = true;
    }
    sap.n.Design.LastSeen.layout.dedicated = dedicated;
    sap.n.Design.LastSeen.setLayout(sap.n.Design.LastSeen.layout);
    if (refresh) {
        sap.n.Design.loadLayout();
    }
};

sap.n.Design.LastSeen.updateSystem = (system)=>{
    let refresh = false;
    if (AppCache.enableSystemTheme && sap.n.Design.LastSeen.layout.system !== system) {
        refresh = true;
    }
    sap.n.Design.LastSeen.layout.system = system;
    sap.n.Design.LastSeen.setLayout(sap.n.Design.LastSeen.layout);
    if (refresh) {
        sap.n.Design.loadLayout();
    }
};

sap.n.Design.LastSeen.updateLight = (light)=>{
    let refresh = false;
    if (AppCache.enableSystemTheme && sap.n.Design.LastSeen.layout.light !== light) {
        refresh = true;
    }
    sap.n.Design.LastSeen.layout.light = light;
    sap.n.Design.LastSeen.setLayout(sap.n.Design.LastSeen.layout);
    if (refresh) {
        sap.n.Design.loadLayout();
    }
};

sap.n.Design.LastSeen.updateDark = (dark)=>{
    let refresh = false;
    if (AppCache.enableSystemTheme && sap.n.Design.LastSeen.layout.dark !== dark) {
        refresh = true;
    }
    sap.n.Design.LastSeen.layout.dark = dark;
    sap.n.Design.LastSeen.setLayout(sap.n.Design.LastSeen.layout);
    if (refresh) {
        sap.n.Design.loadLayout();
    }
};

sap.n.Design.LastSeen.read = (callback)=>{
    const layout = sap.n.Design.LastSeen.getLayout();
    if (!layout && !!neptune.layout.userSettings) {
        sap.n.Design.LastSeen.setLayout(neptune.layout.userSettings);
    }
    callback();
};

sap.n.Design.LastSeen.getLayoutSystem = ()=>sap.n.Design.LastSeen.layout.system;

sap.n.Design.LastSeen.setLayoutSystem = (layoutSystem)=>{
    sap.n.Design.LastSeen.layout.system = layoutSystem;
    localStorage.setItem(AppCache.CurrentConfig + "_LastSeenLayout", JSON.stringify(sap.n.Design.LastSeen.layout));
};

sap.n.Design.fetchLayout = function (id) {
    if (!id) {
        console.error("Missing layout ID...");
        return;
    }

    return jsonRequest({
        url: `${AppCache.Url}/api/functions/Launchpad/LayoutRead`,
        data: JSON.stringify({
            id: id
        }),
        headers: {},
        xhrFields: {
            withCredentials: true,
        },
    });
};

sap.n.Design.applyLayout = (config)=>{

    const layout = config.layout;
    const preview = config.preview || false;
    const force = config.force || false;

    if (!layout?.id) return;
    if (preview) {
        AppCache.CurrentLayout = null;
    }
    if (AppCache.CurrentLayout && AppCache.CurrentLayout.id === layout.id && document.getElementById("NeptuneStyleCSSDiv").innerHTML !== "" && !force) {
        return;
    }

    sap.n.Launchpad.layoutConfig = config;

    // ModelData.Update(AppCacheLayout, "id", layout.id, layout);
    // setCacheAppCacheLayout();    

    let theme = AppCache.defaultTheme;
    let baseTheme = AppCache.defaultTheme;
    let themeRoot = ``;
    let themeBrightness = `Light`;

    if (!!layout.THEME) {
        theme = layout.THEME;
        baseTheme = layout.BASE_THEME || theme;
        themeRoot = layout.THEME_ROOT;
        themeBrightness = layout.THEME_BRIGHTNESS;
    }

    $('html').attr('class', (i, c)=>{
        return c.replace(/(^|\s)nepBaseTheme-\S+/g, '');
    });
    document.documentElement.classList.add("nepBaseTheme-" + baseTheme);

    document.documentElement.classList.remove("sapContrastPlus");
    document.documentElement.classList.remove("nepThemeLight");
    document.documentElement.classList.remove("nepThemeDark");
    document.documentElement.classList.remove("nepTheme");
    document.documentElement.classList.add("nepTheme" + themeBrightness);
    document.documentElement.classList.add("nepLayout");

    if (layout.BASE_THEME === "sap_belize_plus") {
        document.documentElement.classList.add("sapContrastPlus");
    }

    theme = theme.toLowerCase();

    if (theme !== sap.ui.getCore().getConfiguration().getTheme()) {

        if (typeof themeRoot !== "undefined" && !!themeRoot) {

            if (AppCache.isMobile && !AppCache.enablePwa && themeRoot.indexOf("/") === 0) {
                themeRoot = themeRoot.substring(1);
            }
            sap.ui.getCore().applyTheme(theme, themeRoot);

        } else {
            sap.ui.getCore().applyTheme(theme);
        }
    } else {
        sap.n.Launchpad.afterTheme();
    }
};

sap.n.Design.loadLayout = (config)=>{
    const force = config?.force || false;

    const _loadLayout = (themeLayout)=>{

        if (themeLayout) {
            sap.n.Design.applyLayout({
                layout: JSON.parse(JSON.stringify(themeLayout)),
                force: force
            });

        } else {
            neptune.Style.themeDetection(darkMode=>{
                sap.n.Design.applyLayout({
                    layout: JSON.parse(JSON.stringify(sap.n.Design.getDefaultUserLayout({
                        darkMode: darkMode
                    }))),
                    force: force
                });
            });
        }
    };

    sap.n.Design.LastSeen.read(()=>{

        if (AppCache.enableSystemTheme) {

            neptune.Style.themeDetection(darkMode=>{

                let systemTheme = sap.n.Design.LastSeen.layout.system;
                if (systemTheme === sap.n.Launchpad.theme.system.default) {
                    systemTheme = (darkMode) ? sap.n.Launchpad.theme.system.dark : sap.n.Launchpad.theme.system.light;
                }

                if (systemTheme === sap.n.Launchpad.theme.system.light) {

                    let lightLayout = false;

                    if (!!sap.n.Design.LastSeen.layout.light) {

                        // First light user layout
                        lightLayout = modelAppCacheLayout.oData.layouts.find(layout=>{
                            return (layout.id === sap.n.Design.LastSeen.layout.light);
                        });

                    } else if (typeof modelAppCacheLayout.oData.layoutLight === 'object' && Object.keys(modelAppCacheLayout.oData.layoutLight).length > 0) {
                        lightLayout = modelAppCacheLayout.oData.layoutLight;
                    } else {
                        lightLayout = AppCache.layoutLight;
                    }

                    _loadLayout(lightLayout);

                } else if (systemTheme === sap.n.Launchpad.theme.system.dark) {

                    let darkLayout;

                    if (!!sap.n.Design.LastSeen.layout.dark) {

                        // First dark user layout
                        darkLayout = modelAppCacheLayout.oData.layouts.find(layout=>{
                            return (layout.id === sap.n.Design.LastSeen.layout.dark);
                        });

                    } else if (typeof modelAppCacheLayout.oData.layoutDark === 'object' && Object.keys(modelAppCacheLayout.oData.layoutDark).length > 0) {
                        darkLayout = modelAppCacheLayout.oData.layoutDark;
                    } else {
                        darkLayout = AppCache.darkLayout;
                    }

                    _loadLayout(darkLayout);
                }
            });

        } else if (!!sap.n.Design.LastSeen.layout.dedicated) {

            const dedicatedLayout = modelAppCacheLayout.oData.layouts.find(layout=>layout.id === sap.n.Design.LastSeen.layout.dedicated);
            _loadLayout(dedicatedLayout);

        } else if (Array.isArray(modelAppCacheLayout.oData.layouts) && modelAppCacheLayout.oData.layouts.length > 0) {
            _loadLayout(modelAppCacheLayout.oData.layouts[0]);
        } else {
            return AppCache.layoutLight;
        }
    });
};

sap.n.Design.getDefaultUserLayout = (config)=>{

    const darkMode = config.darkMode;

    let layout = sap.n.Design.getDefaultSystemLayout(darkMode);

    if (layout) {
        return layout;
    } else {
        return {};
    }
};

sap.n.Design.getDefaultSystemLayout = (darkMode)=>{
    if (AppCache.enableSystemTheme) {
        return (darkMode) ? modelAppCacheLayout.oData.layoutDark : modelAppCacheLayout.oData.layoutLight;
    } else if (Array.isArray(modelAppCacheLayout.oData.layouts) && modelAppCacheLayout.oData.layouts.length > 0) {
        return modelAppCacheLayout.oData.layouts[0];
    } else {
        return AppCache.layoutLight;
    }
};
