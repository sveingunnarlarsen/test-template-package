var data = modelAppCacheGroupLayout.oData;
if (!Array.isArray(data) || data.length === 0) {
    modelAppCacheGroupLayout.setData(AppCache.tilegroupLayout);
    setCacheAppCacheGroupLayout();
}