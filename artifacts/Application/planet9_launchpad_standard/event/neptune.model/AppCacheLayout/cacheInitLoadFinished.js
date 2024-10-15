if (!modelAppCacheLayout.oData.layoutLight) modelAppCacheLayout.oData.layoutLight = AppCache.layoutLight;
if (!modelAppCacheLayout.oData.layoutDark) modelAppCacheLayout.oData.layoutDark = AppCache.layoutDark;
if (!Array.isArray(modelAppCacheLayout.oData.layouts)) modelAppCacheLayout.oData.layouts = [];

ModelData.Update(modelAppCacheLayout.oData.layouts, "id", modelAppCacheLayout.oData.layoutLight.id, modelAppCacheLayout.oData.layoutLight);
ModelData.Update(modelAppCacheLayout.oData.layouts, "id", modelAppCacheLayout.oData.layoutDark.id, modelAppCacheLayout.oData.layoutDark);
setCacheAppCacheLayout();

console.log(`R2 AppCacheLayout.cacheInitLoadFinished: ${modelAppCacheLayout?.oData?.layoutLight?.NAME} - ${modelAppCacheLayout?.oData?.layoutDark?.NAME}`);