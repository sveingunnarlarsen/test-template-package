sap.n.Launchpad.BuildTiles = function (dataCat, subCat) {
    let pageCatID = `page${dataCat.id}`;

    const tiles = sap.n.Customization.getTiles(dataCat.id, false);
    const tileGroups = sap.n.Customization.getTileGroups(dataCat.id, false);
    if (tiles.length === 0 && tileGroups.length === 0) return;

    sap.n.Launchpad.currentTileGroupPage = pageCatID;
    sap.n.currentView = "";

    // Mark Menu
    sap.n.Launchpad.MarkTopMenu(dataCat.id);

    // UI Handling
    sap.n.Launchpad.setShellWidth();
    sap.n.Launchpad.setHideHeader(false);

    // Back Button
    if (!subCat && !sap.n.Launchpad.hideBackIcon) AppCacheBackButton.setVisible(false);

    // Create Page Per Tile Group
    let pageCat = sap.ui.getCore().byId(pageCatID);

    if (!pageCat) {
        pageCat = new sap.m.Page(pageCatID, {
            showHeader: false,
            showFooter: false,
            backgroundDesign: "Standard",
        }).addStyleClass(`nepPage${dataCat.id}`);

        pageCat.onAfterRendering = function () {
            if (sap.n.Customization.isEnabled() && !sap.n.Customization.areScreensLocked()) {
                sap.n.Customization.applyDragDropToTiles(pageCat);
            }
        };

        addCustomData(pageCat, {
            type: "page",
            context: "page",
            "category-id": dataCat.id,
        });

        pageCat.addStyleClass("nepPage");
        AppCacheNav.addPage(pageCat);
    }

    if (pageCat.getContent().length === 0) {

        let gridContainer = new sap.m.FlexBox(`${sectionPrefix()}${dataCat.id}`, {
            direction: "Column",
            alignItems: "Start",
            renderType: "Bare",
        }).addStyleClass("nepGridContainer nepGridCards");

        addCustomData(gridContainer, {
            type: "category",
            context: "category-tiles",
            "category-id": dataCat.id,
        });

        const cards = sap.n.Launchpad.GetGroupCards(dataCat, "category", { category: dataCat });
        sap.n.Launchpad.BuildCardContent({
            pageID: pageCatID,
            dataScreen: dataCat,
            dataCat: dataCat,
            cardParent: cards,
            path: [dataCat.id],
        });

        if (!!dataCat.inclFav) {
            cards.addStyleClass("favorite-cards");
        }
        gridContainer.addItem(cards);

        if (!dataCat.hideHeader) {
            pageCat.addContent(sap.n.Launchpad.buildGroupHeader(dataCat));
        }

        if (dataCat.enableMessage) {
            pageCat.addContent(sap.n.Launchpad.buildGroupMessage(dataCat));
        }

        // Add Grid to Page
        if (tileGroups.length > 0 || cards.getItems().length > 0) {
            pageCat.addContent(gridContainer);
        }

        // Child Tile Groups
        tileGroups.forEach(function (data) {
            let dataCatChild = sap.n.Customization.getCategory(data.id);

            if (!dataCatChild) dataCatChild = sap.n.Customization.getTileGroup(data.id);
            if (!dataCatChild) return;

            //Grid containerOpenApp
            let tilegroupContainer = new sap.m.FlexBox(
                `${sectionPrefix()}${dataCat.id}${dataCatChild.id}`,
                {
                    direction: "Column",
                    alignItems: "Start",
                    renderType: "Bare",
                }
            ).addStyleClass("nepGridContainer nepGridCards");

            addCustomData(tilegroupContainer, {
                type: "tilegroup",
                context: "tilegroup-tiles",
                "category-id": dataCat.id,
                "tilegroup-id": dataCatChild.id,
            });

            const cards = sap.n.Launchpad.GetGroupCards(dataCatChild, "tilegroup", {
                category: dataCat,
                tilegroup: dataCatChild,
            });
            if (!!dataCatChild.inclFav) {
                cards.addStyleClass("favorite-cards");
            }
            sap.n.Launchpad.BuildCardContent({
                pageID: pageCatID,
                dataScreen: dataCat,
                dataCat: dataCatChild,
                cardParent: cards,
                parentCat: dataCat,
                path: [dataCat.id, dataCatChild.id],
            });

            tilegroupContainer.addItem(cards);
    
            if (!dataCatChild.hideHeader) {
                pageCat.addContent(sap.n.Launchpad.buildGroupHeader(dataCatChild));
            }
            if (dataCatChild.enableMessage) {
                pageCat.addContent(sap.n.Launchpad.buildGroupMessage(dataCatChild));
            }
            pageCat.addContent(tilegroupContainer);
        });

        if (tileGroups.length > 0 || cards.getItems().length > 0) {
            // add an empty box
            pageCat.addContent(
                new sap.m.HBox(nepId(), {
                    height: "50px",
                    renderType: "Bare",
                })
            );
        }
    }

    sap.n.Launchpad.backApp = pageCat;
    sap.n.Launchpad.setMenuPage(dataCat);

    setTimeout(downloadLazyLoadTileImages, 100);

    // Navigate
    setTimeout(function () {
        const transition = "show";
        AppCacheNav.to(pageCat, transition);
    }, 100);

    // Scrolling to SubMenu
    if (subCat) {
        setTimeout(function () {
            sap.n.Launchpad.scrollToTileGroup(subCat);
        }, 300);
    }
};

sap.n.Launchpad.BuildCardContent = function (config) {

    const dataScreen = config.dataScreen;
    const dataCat = config.dataCat;
    const parentCat = config.parentCat;
    const cardParent = config.cardParent;

    let tiles = [];
    let classId = `nepCat${dataCat.id}`;

    tiles = sap.n.Customization.getTiles(dataCat.id);

    // Card Group
    if (parentCat && parentCat.cardPerRow && !dataCat.cardPerRow)
        dataCat.cardPerRow = parentCat.cardPerRow;
    let cardPerRow = dataCat.cardPerRow || sap.n.Layout.row.MORE;
    cardParent.addStyleClass(`nepBlockLayoutTileRow ${classId} nepGrid${cardPerRow}`);

    if (dataCat.inclFav) {
        cardParent.addItem(
            sap.n.Card.buildCardDefault({
                pageID: config.pageID,
                dataTile: {
                    id: sap.n.Launchpad.guid.fav,
                    type: "favorite",
                    title: AppCache_tFavorites.getText(),
                    forceAttributes: true
                },
                dataScreen: dataScreen,
                dataCat: dataCat,
                path: config.path,
            })
        );
    }

    tiles.forEach(function (tile) {
        if (!tile || !tile.id) return;
        let dataTile = ModelData.FindFirst(AppCacheTiles, "id", tile.id);
        if (!dataTile) return;
        if (dataTile.disabled) return;

        if (sap.n.Launchpad.isDesktop() && dataTile.hideTileDesktop) return;
        if (sap.n.Launchpad.isTablet() && dataTile.hideTileTablet) return;
        if (sap.n.Launchpad.isPhone() && dataTile.hideTileMobile) return;
        if (dataTile.type === "storeitem" && isCordova()) return;

        // Tile Content
        cardParent.addItem(
            sap.n.Card.buildCardDefault({
                pageID: config.pageID,
                dataTile: dataTile,
                dataScreen: dataScreen,
                dataCat: dataCat,
                // isFav: isFav,
                path: config.path,
            })
        );
    });

    if (!tiles.length) cardParent.addStyleClass("nepGridNoTiles");

    // add add new Card Button
    if (sap.n.Customization.isEnabled() && sap.n.Customization.isInitialized()) {

        cardParent.addItem(sap.n.Card.buildCardAdd({
            path: config.path,
            dataScreen: dataScreen,
            dataCat: dataCat,
        }));
    }
};

sap.n.Launchpad.RebuildTiles = function () {
    let currentPage = AppCacheNav.getCurrentPage();
    AppCacheNav.getPages().forEach(function (page) {

        // only for Tile Group + Childs
        if (page.sId.indexOf("page") > -1) {

            // destroy page content, rebuild later when user navigates there
            page.destroyContent();

            // rebuild current page
            if (currentPage.sId === page.sId) {
                const id = currentPage.sId;
                const pageId = id.split("page")[1];

                // can be either a category, or a tilegroup
                let item = sap.n.Customization.getCategory(pageId);
                if (!item) item = sap.n.Customization.getTileGroup(pageId);

                if (!item) AppCache.Home();
                else sap.n.Launchpad.BuildTiles(item, item.id);
            }
        }
    });
};

sap.n.Launchpad.getTileAttribute = (attr, dataScreen, dataCat, dataTile, defaultValue)=>{
    if (dataTile.forceAttributes) {
        return dataTile[attr] || defaultValue;
    }
    return dataScreen[attr] || dataCat[attr] || dataTile[attr] || defaultValue;
};

sap.n.Launchpad.buildGroupHeader = (dataCat)=>{

    // unique CSS class for this header
    const id = "nepGroupHeader" + dataCat.id;
    const groupHeader = new sap.m.VBox(nepId(), {
        renderType: sap.m.FlexRendertype.Bare
    }).addStyleClass("nepGroupHeader " + id);
    
    const groupHeaderBackground = new sap.m.VBox("__nep" + ModelData.genID(), {
        renderType: "Bare"
    }).addStyleClass("nepGroupHeaderImageContent");
    groupHeader.addItem(groupHeaderBackground);
    
    neptune.ElementQuery.register(groupHeader, {
        prefix: "nepGroupHeader",
        isolate: true,
        width: AppCache.cssGridBreakpoints,
    });

    if (dataCat.styleClass) groupHeader.addStyleClass(dataCat.styleClass);

    if (dataCat.cardContentWidth) {
        groupHeader.addStyleClass("nepHeader" + dataCat.cardContentWidth);
    }
    if (dataCat.cardContentAlign) {
        groupHeader.addStyleClass("nepHeaderAlign" + dataCat.cardContentAlign);
    }

    const vbox = new sap.m.VBox(nepId(), {
        alignItems: dataCat.headerTextAlign || "Start",
        renderType: sap.m.FlexRendertype.Bare
    }).addStyleClass("nepCatTitleLayout");
    groupHeader.addItem(vbox);
    
    const [title, subTitle] = sap.n.Launchpad.getPageTitle(dataCat);

    if (title) {
        const titleStyle = (!!dataCat.headerTextLevel) ? dataCat.headerTextLevel : "H3";
        vbox.addItem(new sap.m.Title(nepId(), {
            level: "H2",
            titleStyle: titleStyle,
            text: title
        }).addStyleClass("nepCatTitle"));
        groupHeader.addStyleClass("nepCatTitleLayoutTitle");
    }

    if (subTitle) {
        const subTitleStyle = (!!dataCat.headerSubLevel) ? dataCat.headerSubLevel : "H5";
        vbox.addItem(new sap.m.Title(nepId(), {
            level: "H3",
            titleStyle: subTitleStyle,
            text: subTitle
        }).addStyleClass("nepCatSubTitle"));
        groupHeader.addStyleClass("nepCatTitleLayoutSubTitle");
    }
    return groupHeader;
};

sap.n.Launchpad.buildHeaderCss = (config)=>{

    const dataCat = config.dataCat;
    const id = "nepGroupHeader" + dataCat.id;

    // Get CSS from applied light & dark tile group layout (Cockpit Tile Group Layout Tool)
    const groupLayout = neptune.Style.getGroupLayoutCss({
        layout: dataCat,
        id: id,
        groupLayoutData: sap.n.Launchpad.getGroupLayout()
    });

    // Configured height for tile group large header image
    let backgroundHeight = (!!dataCat.imageHeight) ? dataCat.imageHeight : null;

    // Tile group large header image
    if (dataCat.image) {
        
        let imageUrl = dataCat.image;

        // Image native height calculated when adding the image from the media library
        let imageHeightMedia = dataCat.imageHeightMedia;
        if (dataCat.imageDark && AppCache.CurrentLayout.THEME_BRIGHTNESS === "Dark") {
            imageUrl = dataCat.imageDark;
            imageHeightMedia = dataCat.imageDarkHeightMedia;
        }

        // support for cascading style
        if (imageUrl !== `none`) imageUrl = `url("${imageUrl}")`;

        let backroundPosition = "center center";
        let backroundSize = "cover";
        let backgroundRepeat = "no-repeat";

        if (!!dataCat.imagePlacement) backroundPosition = dataCat.imagePlacement;
        if (!!dataCat.imageRepeat) backgroundRepeat = dataCat.imageRepeat;
        if (!!dataCat.imageSize) backroundSize = dataCat.imageSize;

        // Image height has not been set directly on large header and there is a calculated native image height set
        if (!backgroundHeight && !!imageHeightMedia) {
            backgroundHeight = imageHeightMedia + 'px';
        }
        
        // Large header image will fill 100% of header canvas
        groupLayout.css += `
            .${id} .nepGroupHeaderImageContent {
                position: absolute;
                height: 100%;
                width: 100%;
                background: ${imageUrl};
                background-repeat: ${backgroundRepeat};
                background-position: ${backroundPosition};
                background-size: ${backroundSize};
            }
        `;
    }

    // Set a height for large header, if no height can be determined, the height will take up as much space as the title & sub title needs
    if (!!backgroundHeight) {
        groupLayout.css += `
            .${id} {
                height: ${backgroundHeight};
            }
        `;
    }
    
    // Configured height for tile group medium header image
    backgroundHeight = (!!dataCat.imageTabletHeight) ? dataCat.imageTabletHeight : null;

    // Tile group medium header image
    if (dataCat.imageTablet) {
        
        let imageUrl = dataCat.imageTablet;

        // Image native height calculated when adding the image from the media library
        let imageHeightMedia = dataCat.imageTabletHeightMedia;
        if (dataCat.imageTabletDark && AppCache.CurrentLayout.THEME_BRIGHTNESS === "Dark") {
            imageUrl = dataCat.imageTabletDark;
            imageHeightMedia = dataCat.imageTabletDarkHeightMedia;
        }

        // if no medium image is configured, the large image will be used. Set "none" to overwrite the large image
        if (imageUrl !== `none`) imageUrl = `url("${imageUrl}")`;

        let backroundPosition = "center center";
        let backroundSize = "cover";
        let backgroundRepeat = "no-repeat";

        if (!!dataCat.imageTabletPlacement) backroundPosition = dataCat.imageTabletPlacement;
        if (!!dataCat.imageTabletRepeat) backgroundRepeat = dataCat.imageTabletRepeat;
        if (!!dataCat.imageTabletSize) backroundSize = dataCat.imageTabletSize;

        // Image height has not been set directly on medium header and there is a calculated native image height set
        if (!backgroundHeight && !!imageHeightMedia) {
            backgroundHeight = imageHeightMedia + 'px';
        }

        groupLayout.css += `
            .nepGroupHeaderMedium.${id} .nepGroupHeaderImageContent {
                position: absolute;
                height: 100%;
                width: 100%;
                background: ${imageUrl};
                background-repeat: ${backgroundRepeat};
                background-position: ${backroundPosition};
                background-size: ${backroundSize};
            }
        `;
    }

    if (!!backgroundHeight) {
        groupLayout.css += `
            .nepGroupHeaderMedium.${id} {
                height: ${backgroundHeight};
            }
        `;
    }
    
    // Configured height for tile group small header image
    backgroundHeight = (!!dataCat.imageMobileHeight) ? dataCat.imageMobileHeight : null;

    // Tile group small header image
    if (dataCat.imageMobile) {
        
        let imageUrl = dataCat.imageMobile;

        // Image native height calculated when adding the image from the media library
        let imageHeightMedia = dataCat.imageMobileHeightMedia;
        if (dataCat.imageMobileDark && AppCache.CurrentLayout.THEME_BRIGHTNESS === "Dark") {
            imageUrl = dataCat.imageMobileDark;
            imageHeightMedia = dataCat.imageMobileDarkHeightMedia;
        }

        // if no small image is configured, the large image will be used. Set "none" to overwrite the large image
        if (imageUrl !== `none`) imageUrl = `url("${imageUrl}")`;

        let backroundPosition = "center center";
        let backroundSize = "cover";
        let backgroundRepeat = "no-repeat";

        if (!!dataCat.imageMobilePlacement) backroundPosition = dataCat.imageMobilePlacement;
        if (!!dataCat.imageMobileRepeat) backgroundRepeat = dataCat.imageMobileRepeat;
        if (!!dataCat.imageMobileSize) backroundSize = dataCat.imageMobileSize;

        // Image height has not been set directly on small header and there is a calculated native image height set
        if (!backgroundHeight && !!imageHeightMedia) {
            backgroundHeight = imageHeightMedia + 'px';
        }

        groupLayout.css += `
            .nepGroupHeaderSmall.${id} .nepGroupHeaderImageContent,
            .nepGroupHeaderXSmall.${id} .nepGroupHeaderImageContent {
                position: absolute;
                height: 100%;
                width: 100%;
                background: ${imageUrl};
                background-repeat: ${backgroundRepeat};
                background-position: ${backroundPosition};
                background-size: ${backroundSize};
            }
        `;
    }

    if (!!backgroundHeight) {
        groupLayout.css += `
            .nepGroupHeaderSmall.${id},
            .nepGroupHeaderXSmall.${id} {
                height: ${backgroundHeight};
            }
        `;
    }

    if (!!groupLayout.css) {
        const maskImage = sap.n.Launchpad.getMaskImage(dataCat.headerBackgroundMaskImage, dataCat.headerBackgroundMaskCustom, true);
        const tileBlur = dataCat.headerFilterBlur || "";
        
        const tileBrightness = (!!dataCat.enableHeaderBrightness) ? dataCat.headerFilterBrightness : "";
        const tileGrayscale = (!!dataCat.enableHeaderGrayscale) ? dataCat.headerFilterGrayscale : "";
        const tileHueRotate = (!!dataCat.enableHeaderHueRotate) ? dataCat.headerFilterHueRotate : "";
        const tileInvert = (!!dataCat.enableHeaderInvert) ? dataCat.headerFilterInvert : "";
        const tileOpacity = (!!dataCat.enableHeaderOpacity) ? dataCat.headerFilterOpacity : "";
        const tileSaturate = (!!dataCat.enableHeaderSaturate) ? dataCat.headerFilterSaturate : "";
        let values = ``;

        if (!!tileBlur)       values += `blur(${tileBlur})`;
        if (!!tileBrightness) values += `brightness(${tileBrightness})`;
        if (!!tileGrayscale)  values += `grayscale(${tileGrayscale})`;
        if (!!tileHueRotate)  values += `hue-rotate(${tileHueRotate}deg)`;
        if (!!tileInvert)     values += `invert(${tileInvert})`;
        if (!!tileOpacity)    values += `opacity(${tileOpacity})`;
        if (!!tileSaturate)   values += `saturate(${tileSaturate})`;
        const filter = !!values ? `filter: ${values};` : ``;

        groupLayout.css += `
            .${id} .nepGroupHeaderImageContent {
                ${filter}
                mask-image: ${maskImage};
            }
        `;
    }
    return groupLayout.css;
};

sap.n.Launchpad.getTileLayout = function() {
    return (Array.isArray(modelAppCacheTileLayout.oData)) ? modelAppCacheTileLayout.oData : [];
};

sap.n.Launchpad.getGroupLayout = function() {
    return (Array.isArray(modelAppCacheGroupLayout.oData)) ? modelAppCacheGroupLayout.oData : [];
};

sap.n.Launchpad.getMaskImage = (tileMaskImage, customMaskImage, defaultValue)=>{
    
    if (tileMaskImage === `N`) {
        return `linear-gradient(black,black)`;

    } else if (tileMaskImage === `T`) {
        return `linear-gradient(transparent, black)`;

    } else if (tileMaskImage === `B`) {
        return `linear-gradient(black, transparent)`;

    } else if (tileMaskImage === `L`) {
        return `linear-gradient(to right, transparent, black)`;

    } else if (tileMaskImage === `R`) {
        return `linear-gradient(to left, transparent, black)`;

    } else if (tileMaskImage === `C`) {
        return customMaskImage;

    } else if (!!defaultValue) {
        return `linear-gradient(black,black)`;
    }
    return ``;
};

sap.n.Launchpad.tileBackType = (type) => {
    if (!type) type = `B`; 
    if (type === `B`) return `nepBackgroundImage`;
    if (type === `I`) return `nepInlineImage`;
    if (type === `T`) return `nepTopImage`;
};

sap.n.Launchpad.addScreenCss = (css)=>{
    if (sap.n.Launchpad.screenCss.indexOf(css) < 0) {
        sap.n.Launchpad.screenCss += css;
    };
};

sap.n.Launchpad.buildScreenCss = ()=>{

    sap.n.Launchpad.screenCss = ``;
    sap.n.Launchpad.tileCss = ``;

    Array.isArray(modelAppCacheCategory.oData) && modelAppCacheCategory.oData.forEach(function (dataCat) {

        sap.n.Launchpad.buildContentCss({
            dataScreen: dataCat,
            dataCat: dataCat,
            screenId: dataCat.id,
            sectionId: dataCat.id + dataCat.id
        });

        if (Array.isArray(dataCat.tilegroups)) {

            dataCat.tilegroups.forEach(function (data) {
                let dataCatChild = ModelData.FindFirst(AppCacheCategory, "id", data.id);
                if (!dataCatChild) dataCatChild = ModelData.FindFirst(AppCacheCategoryChild, "id", data.id);
                if (dataCatChild) {
                    const subSectionId = dataCat.id + dataCatChild.id;

                    sap.n.Launchpad.buildContentCss({
                        dataScreen: dataCat,
                        dataCat: dataCatChild,
                        screenId: dataCat.id,
                        sectionId: subSectionId
                    });
                }
            });
        }
    });

    sap.n.Launchpad.screenCss += sap.n.Launchpad.tileCss;
    document.getElementById("NeptuneTileGroupHeaderDiv").innerHTML = sap.n.Launchpad.screenCss;
};

sap.n.Launchpad.buildContentCss = (config)=>{

    const dataScreen = config.dataScreen;
    const dataCat = config.dataCat;
    const screenId = config.screenId;
    const sectionId = config.sectionId;

    sap.n.Launchpad.addScreenCss(neptune.Style.getTileLayoutCss({
        layout: dataCat,
        rowId: "nepCat" + dataCat.id,
        tileLayoutData: sap.n.Launchpad.getTileLayout()
    }));
    sap.n.Launchpad.addScreenCss(sap.n.Launchpad.buildHeaderCss({
        dataScreen: dataScreen,
        dataCat: dataCat,
        screenId: screenId,
        sectionId: sectionId
    }));
    sap.n.Launchpad.buildTileCss({
        dataScreen: dataScreen,
        dataCat: dataCat,
        screenId: screenId,
        sectionId: sectionId
    });

    if (dataCat.PAGE_BACKCOLOR) {
        sap.n.Launchpad.addScreenCss(`.nepPage${screenId} {background-color:${dataCat.HEAD_COLOR};}`);
    }

    Array.isArray(dataCat.tilegroups) && dataCat.tilegroups.forEach(function (data) {

        const dataCatChild = ModelData.FindFirst(AppCacheCategoryChild, "id", data.id);
        if (dataCatChild) {

            sap.n.Launchpad.addScreenCss(neptune.Style.getTileLayoutCss({
                layout: dataCatChild,
                rowId: "nepCat" + dataCatChild.id,
                tileLayoutData: sap.n.Launchpad.getTileLayout()
            }));
            sap.n.Launchpad.addScreenCss(sap.n.Launchpad.buildHeaderCss({
                dataScreen: dataScreen,
                dataCat: dataCatChild,
                screenId: screenId,
                sectionId: sectionId
            }));
            sap.n.Launchpad.buildTileCss({
                dataScreen: dataScreen,
                dataCat: dataCatChild,
                screenId: screenId,
                sectionId: sectionId
            });
        }
    });
};

sap.n.Launchpad.buildTileCss = (config)=>{

    const dataScreen = config.dataScreen;
    const dataCat = config.dataCat;

    sap.n.Launchpad.addScreenCss(neptune.Style.getTileLayoutCss({
        layout: dataCat,
        rowId: "nepCat" + dataCat.id,
        tileLayoutData: sap.n.Launchpad.getTileLayout()
    }));

    const catId = (dataScreen.id === dataCat.id) ? `nepPage${dataCat.id}`: `nepCat${dataCat.id}`;
    const tiles = dataCat.tiles || [];

    tiles.forEach(tile => {

        const dataTile = Array.isArray(modelAppCacheTiles.oData) && modelAppCacheTiles.oData.find(obj => obj.id === tile.id);
        if (dataTile) {
            sap.n.Launchpad.addScreenCss(neptune.Style.getTileLayoutCss({
                layout: dataTile,
                tileId: "tile" + dataTile.id,
                tileLayoutData: sap.n.Launchpad.getTileLayout()
            }));

            if (dataTile.image) {
                
                let imageUrl = dataTile.image;
                if (AppCache.isMobile && dataTile.imageData) imageUrl = dataTile.imageData;

                if (dataTile.imageDark) {
                    let darkImageUrl = dataTile.imageDark;
                    if (AppCache.isMobile && dataTile.darkImageData) darkImageUrl = dataTile.darkImageData;

                    if (AppCache.CurrentLayout.THEME_BRIGHTNESS === "Dark") {
                        imageUrl = darkImageUrl;
                    }
                }

                let tileBackType = sap.n.Launchpad.tileBackType(dataTile.imageType);

                if (!dataTile.forceAttributes) {

                    if (!!dataCat.tileBackType) tileBackType = sap.n.Launchpad.tileBackType(dataCat.tileBackType);

                    let values = ``;

                    if (!!dataCat.tileImageRepeat) values += `background-repeat: ${dataCat.tileImageRepeat};`;
                    if (!!dataCat.tileImageSize)   values += `object-fit: ${dataCat.tileImageSize};`;
                    if (!!dataCat.tileImageSize)   values += `background-size: ${dataCat.tileImageSize};`;
                    if (!!dataCat.tileImagePlacement) values += `object-position: ${dataCat.tileImagePlacement};`;
                    if (!!dataCat.tileImagePlacement) values += `background-position: ${dataCat.tileImagePlacement};`;

                    const sectionMaskImage = sap.n.Launchpad.getMaskImage(dataCat.cardBackgroundMaskImage, dataCat.cardBackgroundMaskCustom, false);
                    if (!!sectionMaskImage) values += `mask-image: ${sectionMaskImage};`;

                    let sectionValues = ``;
                    if (!!dataCat.cardFilterBlur)         sectionValues += `blur(${dataCat.cardFilterBlur})`;
                    if (!!dataCat.enableFilterBrightness) sectionValues += `brightness(${dataCat.cardFilterBrightness})`;
                    if (!!dataCat.enableFilterGrayscale)  sectionValues += `grayscale(${dataCat.cardFilterGrayscale})`;
                    if (!!dataCat.enableFilterHueRotate)  sectionValues += `hue-rotate(${dataCat.cardFilterHueRotate}deg)`;
                    if (!!dataCat.enableFilterInvert)     sectionValues += `invert(${dataCat.cardFilterInvert})`;
                    if (!!dataCat.enableFilterOpacity)    sectionValues += `opacity(${dataCat.cardFilterOpacity})`;
                    if (!!dataCat.enableFilterSaturate)   sectionValues += `saturate(${dataCat.cardFilterSaturate})`;
                    if (!!sectionValues) values += `filter: ${sectionValues};`;

                    if (!!values) {
                        const styleId = `.${catId} .${tileBackType}.nepTile${dataTile.id} .nepTileImageContent`;
                        if (sap.n.Launchpad.screenCss.indexOf(styleId) < 0) {
                            sap.n.Launchpad.screenCss += `
                                ${styleId} {
                                    ${values}
                                }
                            `;
                        }
                    }
                }

                const repeat = dataTile.imageRepeat || `no-repeat`;
                const size = dataTile.imageSize || `cover`;
                const position = dataTile.imagePlacement || `center`;

                const maskImage = sap.n.Launchpad.getMaskImage(dataTile.cardBackgroundMaskImage, dataTile.cardBackgroundMaskCustom, true);
                const tileBlur = dataTile.cardFilterBlur || "";
                
                const tileBrightness = (!!dataTile.enableFilterBrightness) ? dataTile.cardFilterBrightness : "";
                const tileGrayscale = (!!dataTile.enableFilterGrayscale) ? dataTile.cardFilterGrayscale : "";
                const tileHueRotate = (!!dataTile.enableFilterHueRotate) ? dataTile.cardFilterHueRotate : "";
                const tileInvert = (!!dataTile.enableFilterInvert) ? dataTile.cardFilterInvert : "";
                const tileOpacity = (!!dataTile.enableFilterOpacity) ? dataTile.cardFilterOpacity : "";
                const tileSaturate = (!!dataTile.enableFilterSaturate) ? dataTile.cardFilterSaturate : "";

                let values = ``;

                if (!!tileBlur)       values += `blur(${tileBlur})`;
                if (!!tileBrightness) values += `brightness(${tileBrightness})`;
                if (!!tileGrayscale)  values += `grayscale(${tileGrayscale})`;
                if (!!tileHueRotate)  values += `hue-rotate(${tileHueRotate}deg)`;
                if (!!tileInvert)     values += `invert(${tileInvert})`;
                if (!!tileOpacity)    values += `opacity(${tileOpacity})`;
                if (!!tileSaturate)   values += `saturate(${tileSaturate})`;
                const filter = !!values ? `filter: ${values};` : ``;

                const styleId = `.${tileBackType}.nepTile${dataTile.id} .nepTileImageContent`;
                if (sap.n.Launchpad.tileCss.indexOf(styleId) < 0) {
                    if (tileBackType === "nepInlineImage" || tileBackType === "nepTopImage") {

                        sap.n.Launchpad.tileCss += `
                            .${tileBackType}.nepTile${dataTile.id} .nepTileImageContent {
                                max-height: 100%;
                                object-fit: ${size};
                                object-position: ${position};
                                ${filter}
                                mask-image: ${maskImage};
                            }
                        `;

                    } else {
                        sap.n.Launchpad.tileCss += `
                            .${tileBackType}.nepTile${dataTile.id} .nepTileImageContent {
                                position: absolute;
                                left: var(--cardMargin);
                                right: var(--cardMargin);
                                top: var(--cardMargin);
                                bottom: var(--cardMargin);
                                background-image: url(${imageUrl});
                                background-repeat: ${repeat};
                                background-size: ${size};
                                background-position: ${position};
                                ${filter}
                                mask-image: ${maskImage};
                                border-radius: var(--sapTile_BorderCornerRadius);
                            }
                            .${tileBackType}.nepTile${dataTile.id} .nepFCard.sapFCard,
                            .${tileBackType}.nepTile${dataTile.id} .nepFCard.sapFCard.nepTileClickable:not(.nepNoAction):not(.nepBlocked):hover {
                                background: none;
                            }
                        `;
                    }
                }
            }

            if (!!dataTile.CSS && !sap.n.Launchpad.headerCSSTiles[dataTile.id]) {
                sap.n.Launchpad.addScreenCss(dataTile.CSS);
                sap.n.Launchpad.headerCSSTiles[dataTile.id] = true;
            }
        }
    });
};
