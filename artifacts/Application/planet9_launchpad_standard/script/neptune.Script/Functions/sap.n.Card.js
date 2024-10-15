sap.n.Card = {};

sap.n.Card.buildCardDefault = function (config) {

    const pageID = config.pageID;
    const path = config.path;
    const dataTile = config.dataTile;
    const dataScreen = config.dataScreen;
    const dataCat = config.dataCat;
    const addTile = config.addTile;
    const resetSection = config.resetSection;
    const butStartFn = function() {
        (typeof config.butStartFn === "function") ? config.butStartFn() : sap.n.Launchpad.HandleTilePress(dataTile, dataCat);
    };

    let tileBackType;
    let cardWidth = sap.n.Launchpad.getTileAttribute("cardWidth", dataScreen, dataCat, dataTile, sap.n.Layout.tileWidth.SMALL);
    let cardHeight = sap.n.Launchpad.getTileAttribute("cardHeight", dataScreen, dataCat, dataTile, sap.n.Layout.tileHeight.NORMAL);

    // Customization Properties
    const props = sap.n.Customization.getProperties([...path, dataTile.id]);
    if (props.width) cardWidth = props.width;
    if (props.height) cardHeight = props.height;

    const iconPlacement = sap.n.Launchpad.getTileAttribute("iconPlacement", dataScreen, dataCat, dataTile, "");
    const cardClickable = sap.n.Card.isCardClickable(dataCat, dataTile, cardWidth, cardHeight);
    
    if (!!dataTile.image) {
        if (dataTile.forceAttributes) {
            tileBackType = dataTile.imageType || `B`;
        } else {
            tileBackType = dataScreen.tileImageType || dataCat.tileImageType || dataTile.imageType || `B`;
        }
    }

    let cardHeader;

    // Card Container
    const cardContainerId = `${nepId()}_tile${dataTile.id}`;
    let cardContainer = new sap.m.FlexBox(cardContainerId, {
        width: "100%",
        fitContainer: true,
        renderType: "Bare",
    }).addStyleClass(`nepFCardContainer nepTile${cardWidth}  nepTile${dataTile.id}`);

    cardContainer.addEventDelegate({
        onkeyup: function (evt) {
            // open the Tile on pressing Enter
            if (evt.key === "Enter" || evt.key === " ") {
                butStartFn();
            }
        },
    });

    if (tileBackType === "B") {

        // Background image will be added in CSS
        cardContainer.addStyleClass(`nepBackgroundImage`);

        const cardBackground = new sap.m.VBox("__nep" + ModelData.genID(), {
            renderType: "Bare",
            width: "auto"
        }).addStyleClass("nepTileImageContent");

        cardContainer.addItem(cardBackground);

    } else if (tileBackType === "I") {
        cardContainer.addStyleClass(`nepInlineImage`);

    } else if (tileBackType === "T") {
        cardContainer.addStyleClass(`nepTopImage`);
    }

    addCustomData(cardContainer, {
        type: "tile",
        context: "tile",
        "tile-id": dataTile.id,
    });

    // Card
    let card = new sap.f.Card(nepId(), {
        width: "100%",
    }).addStyleClass("nepFCard tile" + dataTile.id);
    
    if (!!addTile) {
        cardContainer.addStyleClass("nepFCardAction nepFCardAdd");
        
    } else if (!!resetSection) {
        cardContainer.addStyleClass("nepFCardAction nepFCardResetSection");

    } else {
        sap.n.Card.addSortContainer({
            cardContainer: cardContainer,
            card: card,
            dataCat: dataCat,
            dataTile: dataTile,
            path: path
        });
    }
    
    cardContainer.addItem(card);

    if (dataTile.styleClass) cardContainer.addStyleClass(dataTile.styleClass);
    if (iconPlacement) cardContainer.addStyleClass("nepIconPlacement" + iconPlacement);

    const iconSrc = sap.n.Card.iconSrc(dataTile, iconPlacement);

    
    if (cardHeight) cardContainer.addStyleClass("nepTile" + cardHeight);
    if (cardClickable) card.addStyleClass("nepTileClickable");
    if (dataTile.cardHeightFit || dataCat.cardHeightFit) card.addStyleClass("sapFCardFitContent");
    
    const titleAlign = sap.n.Launchpad.getTileAttribute("titleAlignment", dataScreen, dataCat, dataTile, "");
    if (!!titleAlign) cardContainer.addStyleClass("nepTitleAlign" + titleAlign);
    
    const titleLevel = sap.n.Launchpad.getTileAttribute("titleLevel", dataScreen, dataCat, dataTile, sap.n.Launchpad.defaultTextLevel.title);
    cardContainer.addStyleClass("nepTitleLevel" + titleLevel);

    const infoLevel = sap.n.Launchpad.getTileAttribute("subTitleLevel", dataScreen, dataCat, dataTile, sap.n.Launchpad.defaultTextLevel.info);
    cardContainer.addStyleClass("nepSubTitleLevel" + infoLevel);

    // Aria Label
    card.onAfterRendering = function () {
        var elem = card.getDomRef();

        elem.setAttribute(
            "aria-label",
            sap.n.Launchpad.translateTile("title", dataTile) +
                " " +
                sap.n.Launchpad.translateTile("subTitle", dataTile)
        );
    };

    const displayCardIcon = (this.displayCardIcon(dataCat, dataTile) && iconPlacement.indexOf("Align") === 0);
    const iconDisplayShape = (sap.n.Card.isCircleDisplayShape(dataCat, dataTile)) ? "Circle" : "Square";
    const title = sap.n.Launchpad.translateTile("title", dataTile);
    const subtitle = sap.n.Launchpad.translateTile("subTitle", dataTile);

    const cardIconSrc = (displayCardIcon) ? iconSrc : "";

    cardHeader = sap.n.Card.newCardHeader({
        title: title,
        subtitle: subtitle,
        iconSrc: cardIconSrc,
        displayCardIcon: displayCardIcon,
        iconDisplayShape: iconDisplayShape
    });

    sap.n.Card.Css.title(dataScreen, dataCat, dataTile, cardHeader);
    sap.n.Card.Css.subTitle(dataCat, dataTile, cardHeader);

    if (!!cardIconSrc) {
        card.addStyleClass("nepFCardIconInline");
    }

    cardHeader.iconPlacement = iconPlacement;
    cardHeader.displayCardIcon = displayCardIcon;
    if (displayCardIcon && sap.n.Launchpad.tileContent[dataTile.id]) {
        sap.n.Launchpad.tileContent[dataTile.id].cardHeader.push(cardHeader);
    }

    if (!dataTile.title && !cardIconSrc && cardHeight === sap.n.Layout.tileHeight.TINY) {
        card.addStyleClass("nepFCardHeaderEmpty");
    }
    if (!dataTile.title && !cardIconSrc && !dataTile.subTitle) {
        card.addStyleClass("nepFCardHeaderEmpty");
    }
    card.setHeader(cardHeader);

    if (!!dataTile.title) {
        card.addStyleClass("nepFCardTitle");
    }

    // Content
    let cardContent = new sap.m.FlexBox(nepId(), {
        renderType: "Bare",
        direction: "Column",
        height: "100%",
        width: "100%",
    }).addStyleClass("nepFCardContent");
    card.setContent(cardContent);

    // Card Content Layout - Includes inline image and other content below in the card body
    let cardContentLayout = new sap.m.VBox(nepId(), {
        renderType: "Bare",
        width: "100%"
    }).addStyleClass("nepFCardContentLayout");
    cardContent.addItem(cardContentLayout);

    // Tile image, placed at top, inline or background
    let styleClass, imageHeight;

    if (tileBackType === "T" || tileBackType === "I") {

        const imageId = nepId();
        let imageUrl = dataTile.image;
        // if (AppCache.isMobile && dataTile.imageData) imageUrl = dataTile.imageData;

        sap.n.Launchpad.tileImages[dataTile.id] = {
            light: imageUrl
        };
        if (dataTile.imageDark) {
            let darkImageUrl = dataTile.imageDark;
            // if (AppCache.isMobile && dataTile.imageDarkData) darkImageUrl = dataTile.imageDarkData;
            sap.n.Launchpad.tileImages[dataTile.id].dark = darkImageUrl;

            if (AppCache.CurrentLayout.THEME_BRIGHTNESS === "Dark") {
                imageUrl = darkImageUrl;
            }
        }
        if (sap.n.Launchpad.tileContent[dataTile.id]) sap.n.Launchpad.tileContent[dataTile.id].cardImage.push(imageId);

        if (dataTile.forceAttributes) {
            imageHeight = dataTile.imageHeight || `auto`;
        } else {
            imageHeight = dataScreen.tileBackgroundHeight || dataCat.tileBackgroundHeight || dataTile.imageHeight || `auto`;
        }

        if (tileBackType === "T") {
            cardHeader.topImageId = imageId;
        }

        let cardImage = new sap.m.Image(imageId, {
            src: imageUrl,
            width: "100%",
            height: imageHeight,
            densityAware: false,
        }).addStyleClass(`nepTileImageContent`);
        cardContentLayout.addItem(cardImage); 
    }

    // Content Body
    let cardBody = new sap.m.FlexBox(nepId(), {
        fitContainer: true,
        renderType: "Bare",
        direction: "Column",
        justifyContent: "Start",
    }).addStyleClass("nepFCardBody");
    cardContentLayout.addItem(cardBody);

    let cardIcon;

    if (iconPlacement.indexOf("Align") === -1 && dataTile.type !== "application") {

        let addIcon = true;
        if (addIcon && this.displayCardIcon(dataCat, dataTile)) {

            cardIcon = sap.n.Card.buildCardIcon({
                dataScreen: dataScreen,
                dataCat: dataCat,
                dataTile: dataTile
            });

            if (cardIcon && iconPlacement.indexOf("Above") === 0) {
                card.addStyleClass("nepFCardIcon");
                cardBody.addItem(cardIcon);
                cardHeader.topIconId = cardIcon.getId();

            } else {
                cardBody.addStyleClass("sapFCardHeader");
                if (cardIcon) {
                    card.addStyleClass("nepFCardIcon");
                    cardBody.addItem(cardIcon);
                }
            }
        }
    }

    // Card Body Content
    switch (dataTile.type) {

        case "favorite":
            cardContainer.addStyleClass("nepFCardWidgetList nepFCardFavorites");
            if (!AppCache.widgetLimit) cardContainer.addStyleClass("nepFCardWidgetNoLimit");
            if (AppCache.widgetWrap) cardContainer.addStyleClass("nepFCardWidgetWrap");

            let appContainer = new sap.m.VBox(nepId(), {
                renderType: "Bare",
                width: "100%"
            }).addStyleClass("nepTileApplicationPanel");

            appContainer.addItem(sap.n.Widget.addFavorite({
                dataTile: dataTile,
                cardContainer: cardContainer,
                cardHeader: cardHeader,
                path: path
            }));
            cardBody.addItem(appContainer);
            break;

        case "adaptive":
            cardBody.addItem(sap.n.Card.buildCardBodyAdaptive({
                dataTile: dataTile
            }));
            break;

        case "application":
            cardBody.addItem(sap.n.Card.buildCardBodyApplication({
                dataTile: dataTile
            }));
            break;

        case "intcard":
            cardBody.addItem(sap.n.Card.buildCardBodyIntCard({
                dataTile: dataTile
            }));
            cardHeader.setVisible(false);
            break;

        case "highchart":
            cardBody.addItem(sap.n.Card.buildCardBodyHighchart({
                dataTile: dataTile,
                pageID: pageID
            }));
            break;

        case "highstock":
            cardBody.addItem(sap.n.Card.buildCardBodyHighstock({
                dataTile: dataTile,
                pageID: pageID
            }));
            break;

        default:
            break;
    }

    // Description
    if (dataTile.description) {
        cardBody.addItem(
            new sap.m.Text({
                text: sap.n.Launchpad.translateTile("description", dataTile)
            }).addStyleClass("nepCardDescription")
        );
    }

    const footerId = nepId();
    const footerHtml = new sap.ui.core.HTML(footerId, {});
    const footerText = sap.n.Launchpad.translateTile("footer", dataTile);
    footerHtml.setContent("<div id='" + footerId + "' class='sapFCardHeader nepFCardFooter nepHideTiny nepHideShort nepHideSkinny nepHideNarrow'><span class='sapFCardStatus'>" + footerText + "</span></div>");
    
    const cardFooter = new sap.m.VBox(nepId(),{
        renderType: "Bare"
    }).addStyleClass("nepFCardFooterLayout");
    cardContent.addItem(cardFooter);

    const footerBox = new sap.m.VBox(nepId(),{
        renderType: "Bare",
        width: "100%"
    }).addStyleClass("nepFCardFooterBox");
    footerBox.addItem(footerHtml);
    cardFooter.addItem(footerBox);

    // Actions
    sap.n.Card.buildCardAction({
        pageID: pageID,
        dataTile: dataTile,
        parent: cardFooter,
        card: card,
        dataCat: dataCat,
        cardContainer: cardContainer,
        butStartFn: butStartFn,
        cardClickable: cardClickable
    });

    let _cardHeader_delegate = {
        onAfterRendering: function() {
            let focusableCardHeader = cardHeader.getDomRef().querySelector(".sapFCardHeaderWrapper");
            if (!focusableCardHeader) focusableCardHeader = cardHeader.getDomRef().querySelector(".sapFCardHeaderContent");
            if (focusableCardHeader) {
                focusableCardHeader.removeAttribute("tabindex");
                focusableCardHeader.removeAttribute("aria-labelledby");
            }
            if (!!cardHeader.topImageId) {
                document.getElementById(cardHeader.getId()).before(neptune.byId(cardHeader.topImageId).getDomRef());
            }
            if (!!cardHeader.topIconId) {
                document.getElementById(cardHeader.getId()).before(neptune.byId(cardHeader.topIconId).getDomRef());
            }
        }
    };
    cardHeader.addEventDelegate(_cardHeader_delegate);
    cardHeader.exit = function() {
        cardHeader.removeEventDelegate(_cardHeader_delegate);
    };
    return cardContainer;
};

sap.n.Card.newCardHeader = function(config) {
    title = config.title;
    subtitle = config.subtitle;
    iconDisplayShape = config.iconDisplayShape;
    displayCardIcon = config.displayCardIcon;
    iconSrc = config.iconSrc;

    if (!!title && !!subtitle && !!displayCardIcon) {
        return new sap.f.cards.Header(nepId(), {
            title: title,
            subtitle: subtitle,
            iconSrc: iconSrc,
            iconDisplayShape: iconDisplayShape
        }).addStyleClass("nepFCardHeader");

    } else if (!!title && !!subtitle) {
        return new sap.f.cards.Header(nepId(), {
            title: title,
            subtitle: subtitle
        }).addStyleClass("nepFCardHeader");

    } else if (!!title && !!displayCardIcon) {
        return new sap.f.cards.Header(nepId(), {
            title: title,
            iconSrc: iconSrc,
            iconDisplayShape: iconDisplayShape
        }).addStyleClass("nepFCardHeader");

    } else if (!!title) {
        return new sap.f.cards.Header(nepId(), {
            title: title
        }).addStyleClass("nepFCardHeader");

    } else if (!!subtitle && !!displayCardIcon) {
        return new sap.f.cards.Header(nepId(), {
            subtitle: subtitle,
            iconSrc: iconSrc,
            iconDisplayShape: iconDisplayShape
        }).addStyleClass("nepFCardHeader");

    } else if (!!subtitle) {
        return new sap.f.cards.Header(nepId(), {
            subtitle: subtitle
        }).addStyleClass("nepFCardHeader");

    } else if (!!displayCardIcon) {
        return new sap.f.cards.Header(nepId(), {
            iconSrc: iconSrc,
            iconDisplayShape: iconDisplayShape
        }).addStyleClass("nepFCardHeader");
    }
    return new sap.f.cards.Header(nepId(), {}).addStyleClass("nepFCardHeader");
}

sap.n.Card.isCircleDisplayShape = function(dataCat, dataTile) {
    let circleDisplayShape = false;
    if (dataCat.imgShapeCircle) {
        circleDisplayShape = true;

    } else if (dataCat.imgShapeSquare) {
        circleDisplayShape = false;

    } else if (dataTile.imgShapeCircle) {
        circleDisplayShape = true;
    }
    return circleDisplayShape;
};

sap.n.Card.buildCardIcon = function(config) {

    const dataCat = config.dataCat;
    const dataTile = config.dataTile;
    let oBlockIcon = false;
    let iconLayout = false;

    if (dataTile.cardImage) {
        let imageUrl = dataTile.cardImage;
        if (AppCache.isMobile && dataTile.cardImageData) {
            cardIconSrc = dataTile.cardImageData;
        }
        cardIconSrc = imageUrl;
    }

    if (!!dataTile.cardImage) {

        const circleDisplayShape = sap.n.Card.isCircleDisplayShape(dataCat, dataTile);

        let iconImageUrl = dataTile.cardImage;
        if (AppCache.isMobile && dataTile.cardImageData) {
            iconImageUrl = dataTile.cardImageData;
        }
        sap.n.Launchpad.tileIconImages[dataTile.id] = {
            light: iconImageUrl
        };

        if (!!dataTile.cardImageDark) {
            let darkIconImageUrl = dataTile.cardImageDark;
            if (AppCache.isMobile && dataTile.cardImageDarkData) {
                darkIconImageUrl = dataTile.cardImageDarkData;
            }
            sap.n.Launchpad.tileIconImages[dataTile.id].dark = darkIconImageUrl;

            if (AppCache.CurrentLayout.THEME_BRIGHTNESS === "Dark") {
                iconImageUrl = darkIconImageUrl;
            }
        }

        oBlockIcon = new sap.m.Image(nepId(), {
            src: iconImageUrl,
            densityAware: false,
        }).addStyleClass("nepTileImage");

        if (circleDisplayShape) {
            oBlockIcon.addStyleClass("nepCircleDisplayShape");
        }
        if (sap.n.Launchpad.tileContent[dataTile.id]) {
            sap.n.Launchpad.tileContent[dataTile.id].iconImage.push(oBlockIcon);
        }

    } else if (dataTile.icon && dataTile.icon.indexOf("sap-icon") === 0) {

        oBlockIcon = new sap.ui.core.Icon(nepId(), {
            src: dataTile.icon,
            useIconTooltip: false
        });
        if (sap.n.Launchpad.tileContent[dataTile.id]) sap.n.Launchpad.tileContent[dataTile.id].icon.push(oBlockIcon);
    }
    if (oBlockIcon) {

        iconLayout = new sap.m.HBox(nepId(), {
            justifyContent: "End",
            renderType: "Bare",
            width: "100%"
        }).addStyleClass("nepFCardIconAbove sapFCardIcon sapFAvatar");
        iconLayout.addItem(oBlockIcon);
    }
    return iconLayout;
};

sap.n.Card.setCardContentHeight = function (config, cardContent) {
    const dataTile = config.dataTile;

    if (
        dataTile.bodyHeight &&
        typeof dataTile.bodyHeight === "string" &&
        dataTile.bodyHeight.trim().length > 0
    ) {
        cardContent.setHeight(dataTile.bodyHeight);
    } else {
        cardContent.setHeight("100%");
    }
};

sap.n.Card.buildCardBodyAdaptive = function (config) {
    const dataTile = config.dataTile;

    let cardContent = new sap.m.Panel(nepId(), {
        backgroundDesign: "Transparent",
    }).addStyleClass("sapUiNoContentPadding nepTileApplicationPanel");

    this.setCardContentHeight({
        dataTile: dataTile
    }, cardContent);

    if (!dataTile.settings.adaptive.idTile) return cardContent;

    neptune.Adaptive.getConfig(dataTile.settings.adaptive.idTile)
        .then(function (startParams) {
            // Exists ?
            if (!startParams) {
                sap.m.MessageToast.show(AppCache_tAdaptiveNotFound.getText());
                return;
            }

            AppCache.Load(startParams.application, {
                parentObject: cardContent,
                appGUID: ModelData.genID(),
                startParams: startParams,
            });
        })
        .catch(function (_data) {});
    return cardContent;
};

sap.n.Card.loadAppIntoTile = function (app, parentObject, startParams) {
    if (!refreshingAuth) {
        AppCache.Load(app, { parentObject, startParams });
        return;
    }

    setTimeout(() => {
        this.loadAppIntoTile(app, parentObject, startParams);
    }, AppCache.DelayOnRefreshingToken.AppInTile);
};

sap.n.Card.buildCardBodyApplication = function (config) {
    const dataTile = config.dataTile;

    let cardContent = new sap.m.Panel(nepId(), {
        backgroundDesign: "Transparent",
    }).addStyleClass("sapUiNoContentPadding nepTileApplicationPanel");

    this.setCardContentHeight({
        dataTile: dataTile
    }, cardContent);

    let startParams = {};
    try {
        startParams = JSON.parse(dataTile.startParams);
    } catch (e) {}

    if (dataTile.tileApplication) {
        this.loadAppIntoTile(dataTile.tileApplication, cardContent, startParams);
    }
    return cardContent;
};

sap.n.Card.buildCardBodyIntCard = function (config) {
    const dataTile = config.dataTile;

    if (!sap.ui.integration) sap.ui.getCore().loadLibrary("sap.ui.integration");

    let cardContent = new sap.m.Panel(nepId(), {
        backgroundDesign: "Transparent",
    }).addStyleClass("sapUiNoContentPadding nepTileApplicationPanel");
    this.setCardContentHeight({
        dataTile: dataTile
    }, cardContent);

    // Integration Card
    let intCard = new sap.ui.integration.widgets.Card(nepId(), {
        width: "100%",
        manifest: AppCache.Url + dataTile.dataUrl,
    }).addStyleClass("nepFCard nepICCard");

    cardContent.addContent(intCard);
    return cardContent;
};

sap.n.Card.buildCardBodyHighchart = function (config) {
    const dataTile = config.dataTile;
    const pageID = config.pageID;

    let cardContent = new sap.m.Panel(nepId(), {
        backgroundDesign: "Transparent",
    }).addStyleClass("sapUiNoContentPadding nepTileApplicationPanel");

    this.setCardContentHeight({
        dataTile: dataTile
    }, cardContent);

    let chartId = "chart" + ModelData.genID();
    let chartHeight = dataTile.bodyHeight || "400px";
    let oHighchart;

    let oHighchartHTML = new sap.ui.core.HTML(nepId(), {
        content: `<div id="${chartId}" style="height:100%; width:100%"></div>`,
        afterRendering: function (oEvent) {
            setTimeout(function () {
                let chartData = localStorage.getItem(`p9TileChart${dataTile.id}`);
                if (chartData) {
                    chartData = JSON.parse(chartData);
                    if (!chartData.chart) chartData.chart = {};
                    chartData.chart.renderTo = chartId;
                    oHighchart = Highcharts.chart(chartData);
                } else {
                    oHighchart = Highcharts.chart({
                        chart: {
                            renderTo: chartId,
                            height: chartHeight,
                            style: { fontFamily: "72" },
                        },
                        credits: { enabled: false },
                        title: { text: "" },
                        subTitle: { text: "" },
                        series: [],
                    });
                }

                // Fetch Data
                if (dataTile.dataUrl) {
                    // Trigger Pull 1. Time
                    setTimeout(function () {
                        sap.n.Launchpad.getHighchartData(
                            dataTile,
                            oHighchart,
                            pageID,
                            chartId,
                            "start"
                        );
                    }, 250);

                    // Pull Interval
                    if (
                        dataTile.dataInterval &&
                        dataTile.dataInterval !== "0" &&
                        !sap.n.Launchpad.Timers[chartId]
                    ) {
                        sap.n.Launchpad.Timers[chartId] = {
                            timer: setInterval(function () {
                                if (
                                    sap.n.Launchpad.Timers[chartId].pageId !==
                                    AppCacheNav.getCurrentPage().sId
                                )
                                    return;
                                sap.n.Launchpad.getHighchartData(
                                    dataTile,
                                    oHighchart,
                                    pageID,
                                    chartId,
                                    "continue"
                                );
                            }, dataTile.dataInterval * 1000),
                            pageId: pageID,
                        };
                    }
                }
            }, 200);
        },
    });

    cardContent.addContent(oHighchartHTML);
    return cardContent;
};

sap.n.Card.buildCardBodyHighstock = function (config) {
    const dataTile = config.dataTile;
    const pageID = config.pageID;

    let cardContent = new sap.m.Panel(nepId(), {
        backgroundDesign: "Transparent",
    }).addStyleClass("sapUiNoContentPadding nepTileApplicationPanel");

    this.setCardContentHeight({
        dataTile: dataTile
    }, cardContent);

    let chartId = "chart" + ModelData.genID();
    let chartHeight = dataTile.bodyHeight || "400px";
    let oHighchart;

    let oHighchartHTML = new sap.ui.core.HTML(nepId(), {
        content: `<div id="${chartId}" style='height:100%;width:100%'></div>`,
        afterRendering: function (oEvent) {
            let chartData = localStorage.getItem("p9TileChart" + dataTile.id);
            if (chartData) {
                let chartData = JSON.parse(chartData);
                if (!chartData.chart) chartData.chart = {};
                chartData.chart.renderTo = chartId;
                oHighchart = Highcharts.stockChart(chartData);
            } else {
                oHighchart = Highcharts.stockChart({
                    chart: {
                        renderTo: chartId,
                        height: chartHeight,
                        style: { fontFamily: "72" },
                    },
                    credits: { enabled: false },
                    title: { text: "" },
                    subTitle: { text: "" },
                    series: [],
                });
            }

            // Fetch Data
            if (dataTile.dataUrl) {
                // Trigger Pull 1. Time
                setTimeout(function () {
                    sap.n.Launchpad.getHighstockData(
                        dataTile,
                        oHighchart,
                        pageID,
                        chartId,
                        "start"
                    );
                }, 250);

                // Pull Interval
                if (
                    dataTile.dataInterval &&
                    dataTile.dataInterval !== "0" &&
                    !sap.n.Launchpad.Timers[chartId]
                ) {
                    sap.n.Launchpad.Timers[chartId] = {
                        timer: setInterval(function () {
                            if (
                                sap.n.Launchpad.Timers[chartId].pageId !==
                                AppCacheNav.getCurrentPage().sId
                            )
                                return;
                            sap.n.Launchpad.getHighstockData(
                                dataTile,
                                oHighchart,
                                pageID,
                                chartId,
                                "continue"
                            );
                        }, dataTile.dataInterval * 1000),
                        pageId: pageID,
                    };
                }
            }
        },
    });

    cardContent.addContent(oHighchartHTML);
    return cardContent;
};

sap.n.Card.buildCardAction = function (config) {
    const dataTile = config.dataTile;
    const dataCat = config.dataCat;
    const parent = config.parent;
    const card = config.card;
    const cardContainer = config.cardContainer;
    const butStartFn = config.butStartFn;
    const cardClickable = config.cardClickable;

    let buttonStyle = "";
    let supportedBrowser = true;
    let openEnabled = true;


    let cardActionContainer = new sap.m.FlexBox(nepId(), {
        renderType: "Bare",
        justifyContent: "SpaceBetween"
    }).addStyleClass("nepActionContainer sapUiSizeCompact");

    let cardActionBtnContainer = new sap.m.FlexBox(nepId(), {
        renderType: "Bare",
        justifyContent: "SpaceBetween"
    }).addStyleClass("nepActionBtnContainer");

    let cardActionBtnLayout = new sap.m.FlexBox(nepId(), {
        renderType: "Bare",
        alignItems: "Center",
        justifyContent: "Start"
    }).addStyleClass("nepCardAction");

    let cardActionMenuLayout = new sap.m.FlexBox(nepId(), {
        renderType: "Bare",
        alignItems: "Center",
    }).addStyleClass("nepCardAction");

    if (!cardClickable) {
        parent.addItem(cardActionContainer);
        cardActionContainer.addItem(cardActionBtnContainer);
        cardActionBtnContainer.addItem(cardActionBtnLayout);
        cardActionBtnContainer.addItem(cardActionMenuLayout);
    }

    // Check Offline Mode -> Disable Open button
    if (AppCache.isOffline) {
        if (dataTile.actionURL) openEnabled = false;
        if (dataTile.type === "storeitem") openEnabled = false;
        if (!dataTile.urlApplication) dataTile.urlApplication = "";

        if (dataTile.actionApplication) {
            let app = ModelData.FindFirst(
                AppCacheData,
                ["application", "language", "appPath"],
                [
                    dataTile.actionApplication.toUpperCase(),
                    getLaunchpadLanguage(),
                    dataTile.urlApplication || "",
                ]
            );
            if (!app) openEnabled = false;
        }

        if (dataTile.actionWebApp) {
            if (dataTile.openWindow) {
                openEnabled = false;
            } else {
                const viewName = getWebAppViewName(dataTile.actionWebApp, dataTile.urlApplication);

                // Get App from Cache
                p9GetView(viewName)
                    .then(function (viewData) {
                        if (viewData.length < 10) openEnabled = false;
                    })
                    .catch(() => {
                        if (!sapStorageGet(viewName)) openEnabled = false;
                    });
            }
        }
    }

    // Supported Browsers
    const w = dataTile.browserBlockWin;
    if (
        sap.ui.Device.os.name === "win" &&
        w &&
        w !== "[]" &&
        w.indexOf(sap.ui.Device.browser.name) === -1
    ) {
        supportedBrowser = false;
    }

    const m = dataTile.browserBlockMac;
    if (
        sap.ui.Device.os.name === "mac" &&
        m &&
        dataTile.browserBlockWin !== "[]" &&
        m.indexOf(sap.ui.Device.browser.name) === -1
    ) {
        supportedBrowser = false;
    }

    let butStart;

    if (
        dataTile.actionType === "F" ||
        dataTile.actionApplication ||
        dataTile.actionWebApp ||
        dataTile.actionURL ||
        dataTile.actiongroup ||
        dataTile.type === "storeitem"
    ) {
        if (supportedBrowser) {
            if (dataTile.blackoutEnabled) {
                butStart = new sap.m.Button(nepId(), {
                    text: dataTile.blackoutText,
                    press: function (oEvent) {
                        blackoutDescriptionMessage.setHtmlText(dataTile.blackoutDescription);
                        popBlackout.openBy(this);
                    },
                });
                butStart.addStyleClass(
                    "nepTileAction sapUiTinyMarginEnd nepTileBlackout " + buttonStyle
                );

            } else {
                if (cardClickable) {
                    if (openEnabled) {
                        card.attachBrowserEvent("tap", function (oEvent) {
                            // button would decide the tap action
                            if (oEvent.target && oEvent.target.classList.contains("sapMBtnIcon")) {
                                return;
                            }

                            oEvent.stopImmediatePropagation();
                            setTimeout(function () {
                                butStartFn();
                            }, 50);
                        });
                        card.attachBrowserEvent("keypress", function (oEvent) {
                            setTimeout(function () {
                                if (oEvent.code !== "Enter") {
                                    return;
                                }
                                butStartFn();
                            }, 50);
                        });
                        cardActionContainer.addStyleClass("nepNavBarTile");
                        let _card_delegate = {
                            onAfterRendering: function () {
                                let elem = card.getDomRef();
                                elem.setAttribute("role", "button");
                                elem.removeAttribute("aria-labelledby");
                            },
                        };
                        card.addEventDelegate(_card_delegate);
                        card.exit = function () {
                            card.removeEventDelegate(_card_delegate);
                        };
                    }
                } else {
                    let openText = dataTile.cardButtonIconOnly ? "" : AppCache_tOpen.getText();
                    if (dataTile.openText) openText = sap.n.Launchpad.translateTile("openText", dataTile);
                    butStart = new sap.m.Button(nepId(), {
                        text: openText,
                        enabled: openEnabled,
                        icon: dataTile.cardButtonIcon,
                        press: function (oEvent) {
                            butStartFn();
                        },
                    });

                    butStart.attachBrowserEvent("contextmenu", (oEvent) => {
                        oEvent.preventDefault();
                        oEvent.stopPropagation();

                        localStorage.removeItem(`lp-open-tile-${dataTile.id}`);
                        butStartFn();
                    });

                    butStart.addStyleClass("nepTileAction sapUiTinyMarginEnd " + buttonStyle);
                }
            }

        } else {            
            butStart = new sap.m.Button(nepId(), {
                text: AppCache_tIncompatible.getText(),
                iconFirst: false,
                enabled: openEnabled,
                icon: "sap-icon://sys-help",
                press: function (oEvent) {
                    let browsers;

                    if (sap.ui.Device.os.name === "win")
                        browsers = JSON.parse(dataTile.browserBlockWin);
                    if (sap.ui.Device.os.name === "mac")
                        browsers = JSON.parse(dataTile.browserBlockMac);

                    const m = {
                        cr: "Chrome",
                        ed: "Edge",
                        ff: "Firefox",
                        ie: "Internet Explorer",
                        op: "Opera",
                        sf: "Safari",
                    };

                    let array = browsers.map(function (k) {
                        return { name: m[k] };
                    });
                    array.sort(sort_by("name"));
                    modellistSupportedBrowsers.setData(array);
                    popSupportedBrowsers.openBy(this);
                },
            });

            butStart.addStyleClass(
                "nepTileAction nepTileBlocked sapUiTinyMarginEnd " + buttonStyle
            );
        }

        if (!cardClickable || dataTile.blackoutEnabled) {
            cardActionBtnLayout.addItem(butStart);
            cardActionMenuLayout.addItem(new sap.m.Button(nepId(), {
                tooltip: AppCache_tContextMenu.getText(),
                icon: "sap-icon://overflow",
                press: function (oEvent) {
                    sap.n.Customization.Popover.open(this, {
                        dataTile: dataTile,
                        card: card.getId(),
                        cardContainer: cardContainer
                    });
                },
            }));
        }
    }
};

sap.n.Card.iconSrc = function(dataTile, iconPlacement) {
    let iconSrc = dataTile.icon || "";

    if (dataTile.cardImage) {
        let iconImageUrl = dataTile.cardImage;
        iconSrc = iconImageUrl;
        if (!!iconPlacement && iconPlacement.indexOf("Align") === 0) {
            sap.n.Launchpad.tileIconImages[dataTile.id] = {
                light: iconImageUrl
            };
        }
        if (dataTile.cardImageDark) {
            let darkIconImageUrl = dataTile.cardImageDark;
            if (!!iconPlacement && iconPlacement.indexOf("Align") === 0) {
                sap.n.Launchpad.tileIconImages[dataTile.id].dark = darkIconImageUrl;
            }
            if (AppCache.CurrentLayout.THEME_BRIGHTNESS === "Dark") {
                iconSrc = darkIconImageUrl;
            }
        }
    }
    return iconSrc;
};

sap.n.Card.buildCardResetSection = function(config) {
    const dataScreen = config.dataScreen;
    const dataCat = config.dataCat;
    const path = config.path;

    let card = this.buildCardDefault({
        path: path,
        dataTile: {
            id: "ResetApplication",
            icon: "sap-icon://reset",
            cardWidth: sap.n.Layout.tileWidth.Narrow,
            cardHeight: sap.n.Layout.tileHeight.Short,
            openClickTile: true
        },
        width: sap.n.Layout.tileWidth.Narrow,
        height: sap.n.Layout.tileHeight.Short,
        dataScreen: dataScreen,
        dataCat: dataCat,
        resetSection: true,
        butStartFn: function(e) {
            sap.n.Customization.resetSection({
                catId: dataCat.id
            });
        }
    });
    return card;
};

sap.n.Card.buildCardAdd = function(config) {
    const dataScreen = config.dataScreen;
    const dataCat = config.dataCat;
    const path = config.path;

    let card = this.buildCardDefault({
        path: path,
        dataTile: {
            id: "AddApplication",
            icon: "sap-icon://add",
            cardWidth: sap.n.Layout.tileWidth.Narrow,
            cardHeight: sap.n.Layout.tileHeight.Short,
            openClickTile: true,
        },
        width: sap.n.Layout.tileWidth.Narrow,
        height: sap.n.Layout.tileHeight.Short,
        dataScreen: dataScreen,
        dataCat: dataCat,
        addTile: true,
        butStartFn: function(e) {
            sap.n.Customization.onAddTile(path);
        }
    });
    return card;
};

sap.n.Card.Css = {
    title: function(dataScreen, dataCat, dataTile, element) {
        let tileBackType;
        if (dataTile.forceAttributes) {
            tileBackType = dataTile.imageType || `B`;
        } else {
            tileBackType = dataScreen.tileImageType || dataCat.tileImageType || dataTile.imageType || `B`;
        }

        if (!!dataTile.icon || !!dataTile.cardImage) element.addStyleClass("nepHideTiny");
        if (!!dataTile.image && (tileBackType === "T" || tileBackType === "I")) element.addStyleClass("nepHideTiny");
    },
    subTitle: function(dataCat, dataTile, element) {
        element.addStyleClass("nepHideTiny");
        if (!!dataTile.icon || !!dataTile.cardImage) element.addStyleClass("nepHideShort");
    }
};

sap.n.Card.displayCardText = function(dataScreen, dataCat, dataTile) {
    const tileWidth = sap.n.Launchpad.getTileAttribute("cardWidth", dataScreen, dataCat, dataTile, sap.n.Layout.tileWidth.SMALL);
    const tileHeight = sap.n.Launchpad.getTileAttribute("cardHeight", dataScreen, dataCat, dataTile, sap.n.Layout.tileHeight.NORMAL);
    if (tileHeight === sap.n.Layout.tileHeight.TINY) return false;
    if (tileHeight === sap.n.Layout.tileHeight.SHORT) return false;
    if (tileWidth === sap.n.Layout.tileWidth.SKINNY) return false;
    if (tileWidth === sap.n.Layout.tileWidth.NARROW) return false;
    return true;
};

sap.n.Card.displayCardIcon = function(dataCat, dataTile) {
    return true;
};

sap.n.Card.isCardClickable = function(dataCat, dataTile, width, height) {
    let clickable = dataCat.openClickTile || dataTile.openClickTile || height === sap.n.Layout.tileHeight.SHORT || height === sap.n.Layout.tileHeight.TINY || width === sap.n.Layout.tileWidth.NARROW || width === sap.n.Layout.tileWidth.SKINNY;
    return clickable;
};

sap.n.Card.addSortContainer = function(config) {

    let cardContainer = config.cardContainer;
    let card = config.card;
    let dataCat = config.dataCat;
    let dataTile = config.dataTile;
    const path = config.path;
    let jiggleTimeout;

    let _cardContainer_delegate = {

        ontap: function(e) {
            if (neptune.debug.mouse) console.log("ontap");
        },
        ontouchmove: function(e) {
            if (neptune.debug.mouse) console.log("touchmove");
        },
        ontouchstart: function(e) {
            if (neptune.debug.mouse) console.log("ontouchstart");
        },
        ontouchend: function(e) {
            if (neptune.debug.mouse) console.log("ontouchend");
        },
        onmousemove: function(e) {
            if (neptune.debug.mouse) console.log("onmousemove");
            sap.n.Customization.mouseMoveX = e.screenX;
            sap.n.Customization.mouseMoveY = e.screenY;
        },
        ondblclick: function(e) {
            if (neptune.debug.mouse) console.log("ondblclick");
        },
        onmousedown: function(e) {
            if (neptune.debug.mouse) console.log("onmousedown");
            if (AppCache.disableContextMenu) return;

            sap.n.Customization.mouseMoveX = e.screenX;
            sap.n.Customization.mouseMoveY = e.screenY;

            sap.n.Customization.tileHeight = $("#" + cardContainer.getId()).outerHeight();

            if ($("html").hasClass("jiggle")) return;

            jiggleTimeout = setTimeout(function() {

                if (neptune.debug.mouse) console.log("onmousedown: jiggleTimeout...");
                if (sap.n.Customization.tileResizing) return;

                let diffX = Math.abs(e.screenX - sap.n.Customization.mouseMoveX);
                let diffY = Math.abs(e.screenY - sap.n.Customization.mouseMoveY);

                if (diffX < 20 && diffY < 20) {
                    if (neptune.debug.mouse) console.log("onmousedown: jiggleTimeout: xy < 20...");
                }
            }, 1000);
        },
        oncontextmenu: function(e) {

            if (sap.n.Customization.isJiggling()) return;
            if (e.button < 2) return;

            const { disableScreenChanges } = modelAppCacheDiaSettings.getData();
            if (disableScreenChanges) return true;

            sap.n.Customization.Popover.open(card, {
                dataTile: dataTile,
                card: card.getId(),
                cardContainer: cardContainer
            });
            e.preventDefault();
        },
        onmouseup: function(e) {
            if (neptune.debug.mouse) console.log("onmouseup");
            clearTimeout(jiggleTimeout);
        }
    };
    cardContainer.addEventDelegate(_cardContainer_delegate);
    cardContainer.exit = function() {
        cardContainer.removeEventDelegate(_cardContainer_delegate);
    };

    if (sap.n.Customization.isEnabled()) {

        cardContainer.addStyleClass("nepFCardSortable");

        const sortContainer = new sap.m.FlexBox("__nepSortContainer-" + dataCat.id + "-" + dataTile.id, {
            fitContainer: true,
            renderType: "Bare",
            alignContent: "Center",
            alignItems: "Center",
            justifyContent: "Center"
        }).addStyleClass("nepTileSortable");

        sortContainer.addItem(new sap.ui.core.Icon(nepId(), {
            src: "sap-icon://move",
            useIconTooltip: false
        }));

        cardContainer.addItem(sortContainer);

        let btnDelete = new sap.m.Button("__nepDeleteCard" + ModelData.genID(), {
            icon: "sap-icon://less",
            type: "Reject",
            press: function(e) {
                sap.n.Customization.remove([...path, dataTile.id]);
                cardContainer.destroy();
            },
            tooltip: ""
        }).addStyleClass("nepDeleteCard");
        cardContainer.addItem(btnDelete);
    }
};