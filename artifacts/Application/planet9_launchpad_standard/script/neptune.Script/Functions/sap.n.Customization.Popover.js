sap.n.Customization.Popover = {

    // context in which popover was called
    context: null,
    openedByElement: null,

    open(elm, config) {
        if (!elm || this.isOpen()) return;
        const isFav = !!modelAppCacheFavorites.oData.FAVORITES.find(obj=>obj.id === config.dataTile.id);
        pctItemAddFav.setVisible(!isFav);
        pctItemDelFav.setVisible(isFav);
        pctItemHelp.setVisible(!!config.dataTile?.helpText);
        
        this.context = config;
        this.openedByElement = elm;
        popCustomizationTiles.openBy(elm);

        sap.n.Customization.contextOpen = true;
    },

    createEventDelegate(config) {
        let longPressTimer = null;
        return {
            oncontextmenu(e) {
                if (sap.n.Customization.isJiggling()) return;
                if (e.button < 2) return;

                const { disableScreenChanges } = modelAppCacheDiaSettings.getData();
                if (disableScreenChanges) return true;

                const elm = elById(config.elmId);
                if (!elm) return;

                sap.n.Customization.Popover.open(elm, config);
                e.preventDefault();
            },
            onmousedown(e) {
                if (sap.n.Customization.isJiggling()) return;

                const { disableScreenChanges } = modelAppCacheDiaSettings.getData();
                if (disableScreenChanges) return true;

                // long press to show user menu is not applicable for the desktop
                if (navigator.maxTouchPoints === 0) return;

                longPressTimer = setTimeout(() => {
                    const elm = elById(config.elmId);
                    if (!elm) return;

                    sap.n.Customization.Popover.open(elm, config);
                }, 1000);
            },
            onmouseup(e) {
                clearTimeout(longPressTimer);
            },
        };
    },

    onEditCustomPage(id) {
        const category = sap.n.Customization.getCategory(id);
        if (!category) return;

        const { menuText, title, subTitle } = category.props;
        modelPageForm.setData({ id, menuText, title, subTitle });
        diaPage.open();
        diaManagePages.close();
    },

    onAddCustomPage() {
        sap.n.Customization.showAddPageDialog();
        this.close();
    },

    onEditPage() {
        sap.n.Customization.setActivation(true);
        sap.n.Customization.jiggle();
        this.close();
    },

    onHelp() {
        const dataTile = this.context.dataTile;
        blackoutDescriptionMessage.setHtmlText(dataTile.helpText);
        this.close();
        popBlackout.openBy(this.openedByElement);
    },

    onAddFav() {
        const dataTile = this.context.dataTile;
        sap.n.Launchpad.addFav(dataTile);
        this.close();
    },

    onDelFav() {
        const dataTile = this.context.dataTile;
        sap.n.Launchpad.delFav(dataTile.id);
        this.close();
    },

    onDeletePage(id) {
        diaManagePages.close();

        const category = sap.n.Customization.getCategory(id);
        if (!category) return;

        let title = category.title;
        if (category.isCustom) title = category.props.menuText;

        sap.m.MessageBox.confirm(`Are you sure, you want to remove ${title}? `, {
            onClose: function (action) {
                if (action === "OK") {
                    sap.n.Customization.remove([id]);
                    sap.n.Launchpad.BuildMenuTop();

                    if (id === getActivePageCategoryId()) {
                        AppCache._Home();
                    }

                    sap.n.Customization.showManagePagesDialog();
                }
            },
        });
    },

    onActivatePage(id) {
        const [category] = sap.n.Customization.find([id], "inactive");
        if (!category) return;

        category.status = "active";
        sap.n.Customization.save();
        sap.n.Launchpad.BuildMenuTop();
    },

    onManagePages() {
        this.close();
        sap.n.Customization.showManagePagesDialog();
    },

    addTileFromDialog(tileId, parent) {
        const item = CustomizationStorage.formatTile(sap.n.Customization.getTile(tileId));
        const [parentItem] = sap.n.Customization.find(parent);
        sap.n.Customization.add("T", item, parentItem.tiles.length, parent);
        sap.n.Launchpad.RebuildTiles();
    },

    onTileResize() {
        const dataTile = this.context.dataTile;
        const card = this.context.card;
        const cardContainer = this.context.cardContainer;
        this.close();

        sap.n.Customization.initiateTileResize({
            card: card,
            tileId: dataTile.id,
            cardContainer: cardContainer
        });
    },

    onMoveTileToAnotherPage() {
        modeldiaMoveTile.setData(this.context);
        
        const cats = sap.n.Customization.getCategories().filter((c) => c.id !== getActivePageCategoryId());
        modelMoveTile.setData(
            cats.map((c) => ({
                id: c.id,
                title: c.isCustom ? c.props.menuText : c.title,
            }))
        );

        this.close();
        diaMoveTile.open();
    },

    onTileRemove() {
        const { elmId, tileId } = this.context;
        const elm = sap.ui.getCore().byId(elmId);
        if (elm) {
            const ctx = sap.n.Customization.findTileDragContext(tileId, elm.getDomRef());
            if (!ctx) return;

            sap.n.Customization.remove([...ctx.parent, ctx.tileId]);
            elm.destroy();
        }
        this.close();
    },

    init() {
        if (sap.n.Customization.isDisabled()) return;
    },

    isOpen() {
        return popCustomizationTiles.isOpen();
    },

    close() {
        popCustomizationTiles.close();
    },
};