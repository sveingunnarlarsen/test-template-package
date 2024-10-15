sap.n.Widget = {

    favoriteTiles: {},
    
    isWidget: (guid)=>{
        return (guid === sap.n.Launchpad.guid.fav);
    },

    addFavorite: (config)=>{

        const boxWidget = new sap.m.FlexBox("__nepboxWidget-" + ModelData.genID(), {
            renderType: "Bare",
            width: "100%"
        });
        const ListWidget = new sap.f.GridList("__nepListWidget-" + ModelData.genID(), {
            rememberSelections: false,
            showNoData: false,
            showSeparators: "None"
        }).addStyleClass("nepWidget nepWidgetCompact");
        boxWidget.addItem(ListWidget);
        const itemListWidget = new sap.f.GridListItem("__nepitemListWidget-" + ModelData.genID(), {
            type: "Active",
            press: (oEvent)=>{

                if (sap.n.Customization.isJiggling() || sap.n.Customization.contextOpen) return;

                let context = oEvent.oSource.getBindingContext("AppCacheFavorites");
                let data = context.getObject();

                let dataTile = ModelData.FindFirst(AppCacheTiles, "id", data.id);
                if (dataTile) {
                    sap.n.Launchpad.HandleTilePress(dataTile);
                }
                ListWidget.removeSelections(true);
            }
        });
        ListWidget.bindAggregation("items", {
            path: "AppCacheFavorites>/FAVORITES",
            template: itemListWidget,
            templateShareable: true
        });
        
        const boxListWidget = new sap.m.HBox("__nepboxListWidget-" + ModelData.genID(), {
            renderType: "Bare"
        }).addStyleClass("nepWidgetContent");
        itemListWidget.addContent(boxListWidget);
        const boxListWidgetIcon = new sap.m.VBox("__nepboxListWidgetIcon-" + ModelData.genID(), {
            renderType: "Bare"
        }).addStyleClass("nepWidgetContentIcon");
        boxListWidget.addItem(boxListWidgetIcon);
        const iconListWidget = new sap.ui.core.Icon("__nepiconListWidget-" + ModelData.genID(), {
            src: "{AppCacheFavorites>TILE_ICON}"
        });
        boxListWidgetIcon.addItem(iconListWidget);
        const boxListWidgetInfo = new sap.m.VBox("__nepboxListWidgetInfo-" + ModelData.genID(), {
            renderType: "Bare"
        }).addStyleClass("nepWidgetContentInfo");
        boxListWidget.addItem(boxListWidgetInfo);
        const titleListWidget = new sap.m.Text("__neptitleListWidget-" + ModelData.genID(), {
            text: "{AppCacheFavorites>TILE_TITLE}"
        }).addStyleClass("nepWidgetContentInfoTitle");
        boxListWidgetInfo.addItem(titleListWidget);
        const infoListWidget = new sap.m.Text("__nepinfoListWidget-" + ModelData.genID(), {
            maxLines: 1,
            text: "{AppCacheFavorites>TILE_INFO}",
            wrapping: false,
            wrappingType: "Hyphenated"
        }).addStyleClass("nepWidgetContentInfoText");
        boxListWidgetInfo.addItem(infoListWidget);

        const widgetId = config.path + config.dataTile.id;
        const widget = {
            tileId: config.dataTile.id,
            cardContainer: config.cardContainer,
            cardHeader: config.cardHeader,
            list: ListWidget
        };

        sap.n.Widget.favoriteTiles[widgetId] = widget;

        return boxWidget;
    },
};
