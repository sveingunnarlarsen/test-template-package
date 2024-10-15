setCacheAppCacheDiaSettings();

const lockScreensState = this.getSelected();
const disableScreenChangesState = chkAppCacheDisableScreenChanges.getSelected();

chkAppCacheDisableScreenChanges.setEnabled(!lockScreensState);
AppCacheUserActionCustomization.setVisible(
    !lockScreensState && !disableScreenChangesState
);