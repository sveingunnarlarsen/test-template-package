sap.n.GlobalSearch = {
    dialogWidth: {
        oneList: "600px",
        twoLists: "800px",
        threeLists: "1024px",
        fourLists: "1280px"
    },
    dialogHeight: "600px",
    panel: {
        1: "oneList",
        2: "twoLists",
        3: "threeLists",
        4: "fourLists",
    }
};

sap.n.GlobalSearch.open = function(v) {

    var value = v || "";

    const favoriteVisible = (AppCache.enableFavorites && modelAppCacheFavorites.oData.FAVORITES.length > 0);
    const mostusedVisible = (AppCache.enableMostused && modelAppCacheMostused.oData.MOSTUSED.length > 0);

    let visiblePanels = 1;
    if (favoriteVisible) ++visiblePanels;
    if (mostusedVisible) ++visiblePanels;
    const width = 100 / visiblePanels;
    const dialogWidth = 600 + visiblePanels * 120;
    const panelWidth = (window.innerWidth > dialogWidth) ? `${width}%` : `100%`;
    const panelHeight = (window.innerWidth > dialogWidth) ? `auto` : `100%`;

    panelGlobalSearchMostused.setVisible(mostusedVisible);
    tabGlobalSearchMostused.setVisible(mostusedVisible);

    panelGlobalSearchFavorites.setVisible(favoriteVisible);
    tabGlobalSearchFavorites.setVisible(favoriteVisible);

    panelGlobalSearchApplications.setWidth(panelWidth);
    panelGlobalSearchFavorites.setWidth(panelWidth);
    panelGlobalSearchMostused.setWidth(panelWidth);

    panelGlobalSearchApplications.setHeight(panelHeight);
    panelGlobalSearchFavorites.setHeight(panelHeight);
    panelGlobalSearchMostused.setHeight(panelHeight);


    if (window.innerWidth <= dialogWidth && !tabBarGlobalSearch.getVisible()) {
        tabBarGlobalSearch.setVisible(true);
        tabGlobalSearchApplications.addContent(panelGlobalSearchApplications);
        tabGlobalSearchMostused.addContent(panelGlobalSearchMostused);
        tabGlobalSearchFavorites.addContent(panelGlobalSearchFavorites);

    } else if (window.innerWidth > dialogWidth && tabBarGlobalSearch.getVisible()) {

        tabBarGlobalSearch.setVisible(false);
        containerGlobalSearch.addItem(panelGlobalSearchApplications);
        containerGlobalSearch.addItem(panelGlobalSearchMostused);
        containerGlobalSearch.addItem(panelGlobalSearchFavorites);
    }

    setTimeout(function() {

        diaGlobalSearch.open();
        blockToolpageHeader.setVisible(true);

        inGlobaleSearch.setValue(value);
        inGlobaleSearch.fireLiveChange();

        setTimeout(function() {
            const input = inGlobaleSearch.getInputElement();
            if (input && input.setSelectionRange) input.setSelectionRange(2,2);
        });
    });
};

sap.n.GlobalSearch.close = function() {

    diaGlobalSearch.close();

    setTimeout(function() {
        if (!sap.ui.Device.support.touch) {
            if (layoutDummySearch.getVisible()) {
                inDummySearch.focus();
            } else {
                AppCacheShellSearch.focus();
            }
        }
    });
};

sap.n.GlobalSearch.isOpen = function() {
    return (diaGlobalSearch.isOpen());
};

var _inDummySearch_delegate = {
    onclick: function(e) {
        sap.n.GlobalSearch.open();
    }
};
inDummySearch.addEventDelegate(_inDummySearch_delegate);
inDummySearch.exit = function() {
    inDummySearch.removeEventDelegate(_inDummySearch_delegate);
};

var _inGlobaleSearch_delegate = {
    onfocusout: function(e) {
        ListGlobalSearchApplications.getItems().forEach(item => item.removeStyleClass("sapMLIBActive"));
    }
};
inGlobaleSearch.addEventDelegate(_inGlobaleSearch_delegate);
inGlobaleSearch.exit = function() {
    inGlobaleSearch.removeEventDelegate(_inGlobaleSearch_delegate);
};
