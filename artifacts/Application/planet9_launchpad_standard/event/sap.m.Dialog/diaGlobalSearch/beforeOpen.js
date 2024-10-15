let visiblePanels = 1;
if (AppCache.enableFavorites && modelAppCacheFavorites.oData.FAVORITES.length > 0) ++visiblePanels;
if (AppCache.enableMostused && modelAppCacheMostused.oData.MOSTUSED.length > 0) ++visiblePanels;

const width = sap.n.GlobalSearch.dialogWidth[sap.n.GlobalSearch.panel[visiblePanels]];

diaGlobalSearch.setContentWidth(width);
diaGlobalSearch.setContentHeight(sap.n.GlobalSearch.dialogHeight);

