
sap.n.Launchpad.BuildMenu = function (navigateToHome = true) {

    // Enable Fav Buttons
    let cat = ModelData.FindFirst(AppCacheCategory, "inclFav", true);
    if (!!cat?.inclFav) {
        AppCache.enableFavorites = true;

    } else {
        cat = ModelData.FindFirst(AppCacheCategoryChild, "inclFav", true);
        if (!!cat?.inclFav) AppCache.enableFavorites = true;
    }

    Array.isArray(modelAppCacheTiles.oData) && modelAppCacheTiles.oData.forEach(dataTile => {
        sap.n.Launchpad.setTileContentObject(dataTile.id);
    });

    // Add Tile Group/Tile CSS
    sap.n.Launchpad.buildScreenCss();

    if (AppCache.config.enableTopMenu) {
        sap.n.Launchpad.BuildMenuTop();
        launchpadContainer.addStyleClass("nepLaunchpadHorizontalMenu");

    } else {
        launchpadContainer.removeStyleClass("nepLaunchpadHorizontalMenu");
    }

    sap.n.Launchpad.BuildTreeMenu();
    sap.n.Launchpad.BuildTags();
    if (navigateToHome) sap.n.Launchpad.SelectHomeMenu();

    // Fallback, no startApp or Tiles -> Build empty page
    if (!AppCache.StartApp && !AppCache.StartWebApp && !modelAppCacheCategory.oData.length) {
        let pageCat = new sap.m.Page(nepId(), {
            showHeader: false,
            showFooter: false,
            backgroundDesign: "Standard",
        });

        pageCat.addStyleClass("nepPage");
        AppCacheNav.addPage(pageCat);
        AppCacheNav.to(pageCat);
    }
};

sap.n.Launchpad.BuildMenuTop = function () {
    
    AppCacheAppButton.removeAllItems();

    // BuildMenuTop will be called via BuildMenu when sap.n.Customization.init is complete
    if (!sap.n.Customization.isInitialized()) {
        return;
    }

    sap.n.Customization.getCategories().forEach(function (dataCat) {
        if (dataCat.hideFromMenu) return;

        let menuText = sap.n.Launchpad.translateTile("menuText", dataCat);
        if (!menuText) menuText = sap.n.Launchpad.translateTile("title", dataCat);
        if (dataCat.isCustom) {
            menuText = dataCat.props.menuText;
        }
        if (!menuText) menuText = sap.n.Launchpad.translateTile("name", dataCat);

        let popSubMenu;
        let menuItem = new sap.m.Button(`${nepPrefix()}${dataCat.id}`, {
            text: menuText,
            press: function (oEvent) {
                location.hash = `neptopmenu&${dataCat.id}`;
                if (popSubMenu) popSubMenu.close();
            },
        }).addStyleClass("nepTopMenuBtn");

        // Navigation Panel
        const tileGroups = sap.n.Customization.getTileGroups(dataCat.id);
        if (tileGroups.length > 0) {
            let listSubMenu = new sap.m.List(nepId(), {
                showSeparators: "None",
            });

            let menuFn = {
                popOverEntered: false,
                btnEntered: false,
            };

            let buildSubMenu = false;
            tileGroups.forEach(function (data) {
                let dataCatChild = ModelData.FindFirst(AppCacheCategory, "id", data.id);
                if (!dataCatChild)
                    dataCatChild = ModelData.FindFirst(AppCacheCategoryChild, "id", data.id);
                if (!dataCatChild) return;
                if (dataCatChild.hideFromMenu) return;

                const navBtn = new sap.m.StandardListItem(nepId(), {
                    title: sap.n.Launchpad.translateTile("title", dataCatChild),
                    type: "Active",
                    press: function (e) {
                        const pageCatID = `page${dataCat.id}`;

                        if (sap.n.Launchpad.currentTileGroupPage === pageCatID) {
                            sap.n.Launchpad.scrollToTileGroup(dataCatChild.id);
                        } else if (sap.n.Launchpad.currentTileGroupPage !== pageCatID) {
                            menuItem.fireEvent("press");
                            sap.n.Launchpad.BuildTiles(dataCat, dataCatChild.id);
                        } else {
                            if (sap.n.Launchpad.currentTile) AppCache.Back();
                            sap.n.Launchpad.scrollToTileGroup(dataCatChild.id);
                        }

                        menuFn.popOverEntered = false;
                        menuFn.btnEntered = false;
                        if (popSubMenu) popSubMenu.close();

                        AppCacheAppButton.getItems().forEach(function (item) {
                            if (item.removeStyleClass) item.removeStyleClass("nepTopMenuActive");
                        });
                        menuItem.addStyleClass("nepTopMenuActive");
                    },
                });

                listSubMenu.addItem(navBtn);
                buildSubMenu = true;
            });

            if (buildSubMenu) {
                popSubMenu = new sap.m.Popover(`${nepPrefix()}SubMenu${ModelData.genID()}`, {
                    placement: "Bottom",
                    resizable: false,
                    showArrow: false,
                    showHeader: false,
                    contentWidth: "300px",
                    offsetY: 5,
                }).addStyleClass("nepSubMenu nepOverflowMenu");

                popSubMenu.attachBrowserEvent("mouseenter", function (e) {
                    menuFn.popOverEntered = true;
                    menuItem.addStyleClass("nepTopMenuActiveHover");
                });

                popSubMenu.attachBrowserEvent("mouseleave", function (e) {
                    menuFn.popOverEntered = false;
                    menuItem.removeStyleClass("nepTopMenuActiveHover");

                    setTimeout(function () {
                        if (!menuFn.btnEntered) popSubMenu.close();
                    }, 100);
                });

                // Open SubMenu
                menuItem.attachBrowserEvent("mouseenter", function (e) {
                    popSubMenu.openBy(menuItem);
                    menuFn.btnEntered = true;
                });

                menuItem.attachBrowserEvent("mouseleave", function (e) {
                    menuFn.btnEntered = false;
                    setTimeout(function () {
                        if (!menuFn.popOverEntered) popSubMenu.close();
                    }, 100);
                });

                popSubMenu.addContent(listSubMenu);
            }
        }
        AppCacheAppButton.addItem(menuItem);
    });
};

sap.n.Launchpad.BuildTags = function () {
    AppCacheShellSearchTags.destroyItems();

    let tags = {};
    if (Array.isArray(modelAppCacheTiles.oData)) {
        modelAppCacheTiles.oData.forEach(function (tile) {
            if (!tile.tags) return;
            let tileTags = tile.tags.split(",");
            tileTags.forEach(function (tag) {
                tag = tag.toUpperCase();
                if (tags[tag]) return;
                tags[tag] = tag;
            });
        });
    }

    let tagsArr = [];
    Object.entries(tags).forEach(function ([_, elem]) {
        tagsArr.push({ tag: elem });
    });

    toolVerticalMenuTags.setVisible(tagsArr.length > 0);
    tagsArr.sort(sort_by("tag"));

    tagsArr.forEach(function (tag) {
        AppCacheShellSearchTags.addItem(
            new sap.ui.core.ListItem({
                key: tag.tag,
                text: tag.tag,
            })
        );
    });
};

sap.n.Launchpad.BuildTreeMenu = function () {
    let treeData = [];
    let _buildMenuTile = function (dataTileID, dataCat, treeData, parent) {
        let dataTile = ModelData.FindFirst(AppCacheTiles, "id", dataTileID.id);

        if (sap.n.Launchpad.isDesktop() && dataTile.hideTileDesktop) return;
        if (sap.n.Launchpad.isTablet() && dataTile.hideTileTablet) return;
        if (sap.n.Launchpad.isPhone() && dataTile.hideTileMobile) return;

        let title = sap.n.Launchpad.translateTile("title", dataTile);

        if (
            title &&
            (dataTile.actionApplication ||
                dataTile.actionWebApp ||
                dataTile.actionURL ||
                dataTile.actiongroup ||
                dataTile.actionType === "F" ||
                dataTile.type === "storeitem")
        ) {
            let icon = dataTile.icon || "sap-icon://nep/app";
            let type = "tile";

            if (dataTile.actiongroup) {
                icon = "";
                type = "subcat";
            }

            treeData.push({
                id: dataTile.id,
                parent: parent || dataCat.id,
                title: title,
                type: type,
                filter: sap.n.Launchpad.translateTile("title", dataCat),
                tags: dataTile.tags,
                icon: icon,
            });
        }

        // Tile with Tile Group
        if (dataTile.actiongroup) {
            let dataCat = ModelData.FindFirst(AppCacheCategoryChild, "id", dataTile.actiongroup);
            if (!dataCat) return;

            // Tiles
            Array.isArray(dataCat.tiles) && dataCat.tiles.forEach(function (dataSubTile) {
                _buildMenuTile(dataSubTile, dataCat, treeData, dataTile.id);
            });

            // Tile Groups
            Array.isArray(dataCat.tilegroups) && dataCat.tilegroups.forEach(function (dataCatID) {
                let dataCatChild = ModelData.FindFirst(AppCacheCategory, "id", dataCatID.id);
                if (!dataCatChild)
                    dataCatChild = ModelData.FindFirst(
                        AppCacheCategoryChild,
                        "id",
                        dataCatID.id
                    );
                if (!dataCatChild) return;
                if (dataCatChild.hideFromMenu) return;

                treeData.push({
                    id: dataCatChild.id,
                    parent: dataTile.id,
                    title: sap.n.Launchpad.translateTile("title", dataCatChild),
                    type: "childcat",
                    icon: "",
                    filter: sap.n.Launchpad.translateTile("title", dataCatChild),
                });

                // Tiles
                dataCatChild.tiles.forEach(function (dataTile) {
                    _buildMenuTile(dataTile, dataCatChild, treeData, dataCatID.id);
                });
            });
        }
    };

    sap.n.Customization.getCategories().forEach(function (dataCat) {
        if (dataCat.hideFromMenu) return;

        let title = sap.n.Launchpad.translateTile("title", dataCat);
        if (!title && dataCat.isCustom && dataCat.status === "active") {
            title = dataCat.props.menuText || dataCat.props.title;
        }
        if (!title) title = sap.n.Launchpad.translateTile("name", dataCat);

        treeData.push({
            id: dataCat.id,
            parent: "",
            title,
            type: "cat",
        });

        // Tiles
        dataCat.tiles.forEach(function (dataTile) {
            _buildMenuTile(dataTile, dataCat, treeData);
        });

        Array.isArray(dataCat.tilegroups) && dataCat.tilegroups.forEach(function (dataCatID) {
            let dataCatChild = ModelData.FindFirst(AppCacheCategory, "id", dataCatID.id);
            if (!dataCatChild)
                dataCatChild = ModelData.FindFirst(AppCacheCategoryChild, "id", dataCatID.id);
            if (!dataCatChild) return;
            if (dataCatChild.hideFromMenu) return;

            let childTitle = sap.n.Launchpad.translateTile("title", dataCatChild);
            if (!childTitle) childTitle = sap.n.Launchpad.translateTile("name", dataCatChild);

            treeData.push({
                id: dataCatChild.id,
                parent: dataCat.id,
                title: sap.n.Launchpad.translateTile("title", dataCatChild),
                type: "subcat",
                icon: "",
                filter: sap.n.Launchpad.translateTile("title", dataCatChild),
            });

            // Tiles
            dataCatChild.tiles.forEach(function (dataTile) {
                _buildMenuTile(dataTile, dataCatChild, treeData);
            });
        });
    });

    modelContentMenu.setData({
        children: neptune.Utils.convertFlatToNested(treeData, "id", "parent"),
    });

    let group = "";

    const appData = treeData.map((obj, i)=>{
        if (obj.type === "cat") {
            group = obj.title;
        }
        return {
            id: obj.id,
            parent: obj.parent,
            group: group,
            title: obj.title,
            type: obj.type,
            icon: obj.icon,
            sort: i

        }
    }).filter(obj=>obj.type !== "cat");

    modelListGlobalSearchApplications.setData(appData);
    ListGlobalSearchApplications.getBinding("items").sort([
        new sap.ui.model.Sorter("sort", false, (context) => context.getObject().group.toUpperCase()),
    ]);
};