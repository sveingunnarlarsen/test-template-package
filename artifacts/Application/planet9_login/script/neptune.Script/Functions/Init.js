let formLogons = [];
let text1 = '';
let text2 = '';
let text3 = '';

// Custom Login App - Mobile Client
let isMobile = false;
if (typeof AppCache !== 'undefined' && AppCache.isMobile) isMobile = true;

// Add Function to AppCache object when inside Launchpad
if (isMobile) AppCache.loginAppSetSettings = logonScreen.setSettings;

// Forgot Password
const url = new URL(location.href);
const searchParams = url.searchParams;
const token = searchParams.get('token');

if (token) {
    logonScreen.showForm(`newPassword`);
    
    const passwordReason = searchParams.get('reason');
    if (passwordReason === 'expired') {
        txtFormNewPassRequired.setVisible(false);
        txtFormNewPassExpired.setVisible(true);
    } else {
        txtFormNewPassRequired.setVisible(true);
        txtFormNewPassExpired.setVisible(false);
    }
}

// Startup
if (!isMobile) {
    localStorage.removeItem('p9azuretoken');
    localStorage.removeItem('p9azuretokenv2');
    setTimeout(function () {
        logonScreen.getLogonTypes();
    }, 10);
}

sap.ui.getCore().attachInit(()=>{
    const logoSrc = `data:image/svg+xml;base64,PHN2ZyBpZD0ibmVwdHVuZS1jb25uZWN0LWxvZ28iIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjM2IiB2aWV3Qm94PSIwIDAgOTQwLjY5IDQ0MC41MiI+PHBhdGggc3R5bGU9ImZpbGw6IHJnYigyNTUsIDE1OCwgNTEpOyBzdHJva2Utd2lkdGg6IDBweDsiIGQ9Ik05NDAuNywyMjAuMjZsLTIzMy4wNC4xMi0xMTYuNDcsMjAxLjY2LTExMi43LTE5NS4xOWMtLjQ5LS45My0zLjgxLTYuMjgtMy44MS02LjI4LDAsMC0zLjMxLDUuMzMtMy43Nyw2LjIzLS4wMi4wMS0uMDIuMDItLjAzLjAzbC01OS4wNywxMDIuMjMtLjc3LDEuMzNjLTE5LjA0LDMyLjkxLTQ2LjM1LDYwLjQ1LTc5LjEsNzkuNzVzLTcwLjkyLDMwLjM4LTExMS42OCwzMC4zOEM5OC42Miw0NDAuNTIsMCwzNDEuOSwwLDIyMC4yNlM5OC42MiwwLDIyMC4yNiwwQzMwMS43OSwwLDM3Mi45OCw0NC4zLDQxMS4wNiwxMTAuMTR2LS4wMmw1OS44NCwxMDMuNTdoLjAxYy42MiwxLDMuNzksNi44NiwzLjc5LDYuODYsMCwwLDMuMDktNS43MSwzLjc0LTYuNzkuMDEtLjAxLjAxLS4wMi4wMi0uMDJsMTEyLjczLTE5NS4yN2gyMzNsMTE2LjUxLDIwMS43OVoiLz48L3N2Zz4=`;
    AppCacheShellLogoDesktop.setSrc(logoSrc);

    if (neptune.Style.isDarkModeEnabled) {
        AppCacheShellBrandImgBottom.setSrc(`/public/images/connect/neptune-connect-powered-by-dark.svg`);
    } else {
        AppCacheShellBrandImgBottom.setSrc(`/public/images/connect/neptune-connect-powered-by-light.svg`);
    }
});

// Phone 
// setTimeout(function () {
//     if (sap.ui.Device.system.phone) {
//         flexLogon.setHeight('100%');
//         flexLogon.setWidth('100%');
//         flexLogon.addStyleClass('nepFlexPhone');
//         panLogonLocal.setWidth('100%');
//         panLogonLocal.setHeight('100%');
//         panLogonLocal.removeStyleClass('nepPanLogonBorder');
//     }
// }, 100);

// Sorter Function
let sort_by = function (field, reverse, primer) {
    let key = primer ?
        function (x) {
            return primer(x[field])
        } :
        function (x) {
            return x[field]
        };
    reverse = !reverse ? 1 : -1;
    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
}
window.AppCacheShellLogoDesktop = AppCacheShellLogoDesktop;
window.AppCacheShellBrandImgBottom = AppCacheShellBrandImgBottom;