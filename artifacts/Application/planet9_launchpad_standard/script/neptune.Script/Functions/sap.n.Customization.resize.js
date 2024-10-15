sap.n.Customization.Resize = {
    active: false,
    context: null,

    init() {
        this.active = true;
        this.context = {
            config: null,

            x1: -1,
            y1: -1,
            x2: -1,
            y2: -1,

            startWidth: -1,
            startHeight: -1,
            endWidth: -1,
            endHeight: -1,
        }
    },

    getTileSize() {
        const rect = this.context.config.cardContainer.getDomRef().getBoundingClientRect();
        return [rect.width, rect.height];
    },

    getTileWidthClass(width) {
        if (width <= 80) return sap.n.Layout.tileWidth.SKINNY;
        else if (width > 80 && width <= 140) return sap.n.Layout.tileWidth.NARROW;
        else if (width > 140 && width <= 215) return sap.n.Layout.tileWidth.SMALL;
        else if (width > 215 && width <= 430) return sap.n.Layout.tileWidth.MEDIUM;
        else if (width > 430 && width <= 645) return sap.n.Layout.tileWidth.WIDE;
        else if (width > 645 && width <= 860) return sap.n.Layout.tileWidth.WIDER;
        else if (width > 860) return sap.n.Layout.tileWidth.MAX;

        return sap.n.Layout.tileWidth.SMALL; // default
    },

    getHeightClass(height) {
        if (height <= 80) return sap.n.Layout.tileHeight.TINY;
        else if (height > 80 && height <= 160) return sap.n.Layout.tileHeight.SHORT;
        else if (height > 160 && height <= 270) return sap.n.Layout.tileHeight.NORMAL;
        else if (height > 270 && height <= 540) return sap.n.Layout.tileHeight.TALL;
        else if (height > 540 && height <= 710) return sap.n.Layout.tileHeight.TOWER;
        else if (height > 710) return sap.n.Layout.tileHeight.SKYSCRAPER;

        return sap.n.Layout.tileHeight.NORMAL;
    },

    getCardFromCardContainer(container) {
        const cards = container.getItems().filter(item => item.hasStyleClass('nepFCard'));
        if (cards.length === 0) return null;
        return cards[0];
    },

    setTileSize(width, height) {
        const ref = this.context.config.cardContainer;
        [
            sap.n.Layout.tileWidth.SKINNY,
            sap.n.Layout.tileWidth.NARROW,
            sap.n.Layout.tileWidth.SMALL,
            sap.n.Layout.tileWidth.MEDIUM,
            sap.n.Layout.tileWidth.WIDE,
            sap.n.Layout.tileWidth.WIDER,
            sap.n.Layout.tileWidth.MAX
        ].forEach(size => ref.removeStyleClass(`nepTile${size}`));
        const widthClass = this.getTileWidthClass(width);
        ref.addStyleClass(`nepTile${widthClass}`);

        [
            sap.n.Layout.tileHeight.TINY,
            sap.n.Layout.tileHeight.SHORT,
            sap.n.Layout.tileHeight.NORMAL,
            sap.n.Layout.tileHeight.TALL,
            sap.n.Layout.tileHeight.TOWER,
            sap.n.Layout.tileHeight.SKYSCRAPER,
        ].forEach(size => ref.removeStyleClass(`nepTile${size}`));
        
        const heightClass = this.getHeightClass(height);
        if (heightClass) ref.addStyleClass(`nepTile${heightClass}`);
        
        const card = this.getCardFromCardContainer(ref);
        if (!card) return;

        card.setWidth(`${width}px`);
        card.setHeight(`${height}px`);
    }
};

sap.n.Customization.initiateTileResize = (config) => {

    sap.n.Customization.applyTileResize({
        card: config.card,
        cardContainer: config.cardContainer,
        tileId: config.tileId
    });
    $("#" + config.card).resizable("enable");

    sap.n.Customization.editHomeTimeout[config.card] = setTimeout(() => {
        $("#" + config.card).resizable("destroy");
        delete sap.n.Customization.editHomeTimeout[config.card];
    }, 10000);
};

sap.n.Customization.applyTileResize = (config) => {

    const card = config.card;
    const cardContainer = config.cardContainer;
    const tileId = config.tileId;
    const isWidget = sap.n.Widget.isWidget(tileId);

    if (sap.n.Customization.isDisabled()) return;
    const c = sap.n.Customization;

    try {
        const instance = $("#" + card).resizable("instance");
        if (instance) return;
    } catch (e) {}

    $("#" + card).resizable({
        start: (event, ui) => {
            sap.n.Customization.tileResizing = true;
            clearTimeout(sap.n.Customization.editHomeTimeout[card]);
            delete sap.n.Customization.editHomeTimeout[card];

            sap.n.Customization.resizeContainer = sap.ui.getCore().byId(ui.element[0].id).getParent();
            sap.n.Customization.setResizeSize(ui.size);
            sap.n.Customization.resizeContainer.addStyleClass("nepResizePlaceholder");
        },
        stop: (event, ui) => {
            sap.n.Customization.tileResizing = false;

            sap.n.Customization.resizeContainer.removeStyleClass("nepResizePlaceholder");
            $("#" + ui.element[0].id).removeAttr('style');

            c.setTileState({
                tileId: tileId,
                card: card,
                cardContainer: cardContainer
            });
            $("#" + card).resizable("destroy");
        },
        resize: (event, ui) => {

            const uiSizeWidth = ui.size.width + c.tilePadding;
            
            if (uiSizeWidth < c.resize.width) {

                if (uiSizeWidth < c.resize.baseWidth && c.resize.width >= c.resize.baseWidth && !isWidget) {
                    c.removeStyleClasses("width");
                    c.addStyleClass("nepTileSkinny");

                } else if (uiSizeWidth < c.resize.baseWidth * 2 && c.resize.width >= c.resize.baseWidth * 2 && !isWidget) {
                    c.removeStyleClasses("width");
                    c.addStyleClass("nepTileNarrow");

                } else if (uiSizeWidth < c.resize.baseWidth * 4 && c.resize.width >= c.resize.baseWidth * 4) {
                    c.removeStyleClasses("width");
                    c.addStyleClass("nepTileSmall");

                } else if (uiSizeWidth < c.resize.baseWidth * 8 && c.resize.width >= c.resize.baseWidth * 8) {
                    c.removeStyleClasses("width");
                    c.addStyleClass("nepTileMedium");

                } else if (uiSizeWidth < c.resize.baseWidth * 12 && c.resize.width >= c.resize.baseWidth * 12) {
                    c.removeStyleClasses("width");
                    c.addStyleClass("nepTileWide");

                } else if (uiSizeWidth < c.resize.baseWidth * 16 && c.resize.width >= c.resize.baseWidth * 16) {
                    c.removeStyleClasses("width");
                    c.addStyleClass("nepTileWider");
                }

            } else if (uiSizeWidth > c.resize.width) {

                if (uiSizeWidth > c.resize.baseWidth && c.resize.width <= c.resize.baseWidth && !isWidget) {
                    c.removeStyleClasses("width");
                    c.addStyleClass("nepTileNarrow");

                } else if (uiSizeWidth > c.resize.baseWidth * 2 && c.resize.width <= c.resize.baseWidth * 2) {
                    c.removeStyleClasses("width");
                    c.addStyleClass("nepTileNormal");

                } else if (uiSizeWidth > c.resize.baseWidth * 4 && c.resize.width <= c.resize.baseWidth * 4) {
                    c.removeStyleClasses("width");
                    c.addStyleClass("nepTileMedium");

                } else if (uiSizeWidth > c.resize.baseWidth * 8 && c.resize.width <= c.resize.baseWidth * 8) {
                    c.removeStyleClasses("width");
                    c.addStyleClass("nepTileWide");

                } else if (uiSizeWidth > c.resize.baseWidth * 12 && c.resize.width <= c.resize.baseWidth * 12) {
                    c.removeStyleClasses("width");
                    c.addStyleClass("nepTileWider");

                } else if (uiSizeWidth > c.resize.baseWidth * 16 && c.resize.width <= c.resize.baseWidth * 16) {
                    c.removeStyleClasses("width");
                    c.addStyleClass("nepTileMax");
                }
            }
            c.resize.width = uiSizeWidth;

            if (ui.size.height < c.resize.height) {

                if (ui.size.height < c.resize.baseHeight && !isWidget) {
                    if (c.resize.rows !== 1) {
                        c.removeStyleClasses("height");
                        c.resize.rows = 1;
                        c.addStyleClass("nepTileTiny");
                    }

                } else if (ui.size.height < c.resize.baseHeight * 2 && !isWidget) {
                    if (c.resize.rows !== 2) {
                        c.removeStyleClasses("height");
                        c.resize.rows = 2;
                        c.addStyleClass("nepTileShort");
                    }

                } else if (ui.size.height < c.resize.baseHeight * 4) {
                    if (c.resize.rows !== 4) {
                        c.removeStyleClasses("height");
                        c.resize.rows = 4;
                        c.addStyleClass("nepTileSmall");
                    }

                } else if (ui.size.height < c.resize.baseHeight * 6) {
                    if (c.resize.rows !== 6) {
                        c.removeStyleClasses("height");
                        c.resize.rows = 6;
                        c.addStyleClass("nepTileTall");
                    }

                } else if (ui.size.height < c.resize.baseHeight * 8) {
                    if (c.resize.rows !== 8) {
                        c.removeStyleClasses("height");
                        c.resize.rows = 8;
                        c.addStyleClass("nepTileTower");
                    }
                }

            } else if (ui.size.height >= c.resize.baseHeight) {

                if (ui.size.height > c.resize.baseHeight * 8) {
                    if (c.resize.rows !== 10) {
                        c.removeStyleClasses("height");
                        c.resize.rows = 10;
                        c.addStyleClass("nepTileSkyscraper");
                    }

                } else if (ui.size.height > c.resize.baseHeight * 6) {
                    if (c.resize.rows !== 8) {
                        c.removeStyleClasses("height");
                        c.resize.rows = 8;
                        c.addStyleClass("nepTileTower");
                    }

                } else if (ui.size.height > c.resize.baseHeight * 4) {
                    if (c.resize.rows !== 6) {
                        c.removeStyleClasses("height");
                        c.resize.rows = 6;
                        c.addStyleClass("nepTileTall");
                    }

                } else if (ui.size.height > c.resize.baseHeight * 2) {
                    if (c.resize.rows !== 4) {
                        c.removeStyleClasses("height");
                        c.resize.rows = 4;
                        c.addStyleClass("nepTileNormal");
                    }

                } else if (ui.size.height > c.resize.baseHeight && !isWidget) {
                    if (c.resize.rows !== 2) {
                        c.removeStyleClasses("height");
                        c.resize.rows = 2;
                        c.addStyleClass("nepTileShort");
                    }
                }
            }
            c.resize.height = ui.size.height;
        }
    });
};

sap.n.Customization.setResizeSize = (size) => {

    const obj = $("#" + sap.n.Customization.resizeContainer.getId());
    const computedStyle = window.getComputedStyle(document.getElementById(sap.n.Customization.resizeContainer.getParent().getId()));
    const cells = computedStyle.getPropertyValue("grid-template-columns").split(" ").length;
    const resizeWidth = $("#" + sap.n.Customization.resizeContainer.getParent().getId()).width();
    const c = sap.n.Customization;
    c.tilePadding = +window.getComputedStyle(document.getElementById(sap.n.Customization.resizeContainer.getId())).getPropertyValue("padding").replace("px", "") * 2;

    if (obj.hasClass("nepTileSkinny")) {
        c.resize.columns = 1;
    } else if (obj.hasClass("nepTileNarrow")) {
        c.resize.columns = (cells > 2) ? 2 : cells;
    } else if (obj.hasClass("nepTileSmall")) {
        c.resize.columns = (cells > 4) ? 4 : cells;
    } else if (obj.hasClass("nepTileMedium")) {
        c.resize.columns = (cells > 6) ? 6 : cells;
    } else if (obj.hasClass("nepTileWide")) {
        c.resize.columns = (cells > 8) ? 8 : cells;
    } else if (obj.hasClass("nepTileWider")) {
        c.resize.columns = (cells > 12) ? 12 : cells;
    } else if (obj.hasClass("nepTileMax")) {
        c.resize.columns = cells;
    } else {
        c.resize.columns = (cells > 4) ? 4 : cells;
    }

    c.resize.width = size.width + c.tilePadding;
    c.resize.baseWidth = c.resize.width / c.resize.columns;

    if (obj.hasClass("nepTileTiny")) {
        c.resize.rows = 1;
    } else if (obj.hasClass("nepTileShort")) {
        c.resize.rows = 2;
    } else if (obj.hasClass("nepTileNormal")) {
        c.resize.rows = 4;
    } else if (obj.hasClass("nepTileTall")) {
        c.resize.rows = 6;
    } else if (obj.hasClass("nepTileTower")) {
        c.resize.rows = 8;
    } else if (obj.hasClass("nepTileSkyscraper")) {
        c.resize.rows = 10;
    }

    c.resize.height = size.height;
    c.resize.baseHeight = size.height / c.resize.rows;
};