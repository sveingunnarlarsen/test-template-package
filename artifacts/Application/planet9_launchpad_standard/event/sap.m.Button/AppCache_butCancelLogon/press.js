if (Array.isArray(modelAppCacheUsers.oData) && modelAppCacheUsers.oData.length > 1) {
    AppCache.setEnableUsersScreen();
} else {
    AppCache.setEnablePasscodeEntry();
}
