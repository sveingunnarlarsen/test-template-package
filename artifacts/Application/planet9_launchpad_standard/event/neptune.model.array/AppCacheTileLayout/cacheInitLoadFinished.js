const data = modelAppCacheTileLayout.oData;
if (!Array.isArray(data) || data.length === 0) {
    modelAppCacheTileLayout.setData(AppCache.tileLayout);
    setCacheAppCacheTileLayout();
}
