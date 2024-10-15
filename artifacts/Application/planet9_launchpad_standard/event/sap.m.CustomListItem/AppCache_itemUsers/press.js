const ctx = oEvent.oSource.getBindingContext();
const data = ctx.getObject();

AppCache.userInfo = data;

// PWA - Webauthn
if (
    isPWAEnabled() && 
    AppCache.enablePasscode && 
    AppCache.userInfo.webauthid && 
    (window.PublicKeyCredential !== undefined || typeof window.PublicKeyCredential === 'function')
) {
    sap.n.Webauthn.login(AppCache.userInfo.webauthid)
        .then(function (res) {
            // check if response is an error
            if (res instanceof Error) {
                return;
            }

            if (res instanceof window.PublicKeyCredential) {
                const {
                    response: {
                        authenticatorData: a, clientDataJSON: c, signature: s, userHandle: u
                    }
                } = res;

                const clientData = JSON.parse(new TextDecoder('utf-8').decode(c));
                if (clientData.type !== 'webauthn.get') return;
                
                NumPad.numValue = AppCache.userInfo.webauthid;
                AppCache.Encrypted = '';
                NumPad.Logon();
                
                AppCacheShellUser.setEnabled(true);
                AppCache.setUserInfo();
                AutoLockTimer.start();
            }
        });
} else {
    AppCache.setEnablePasscodeEntry();
}

// Unselect
AppCacheUsers.removeSelections();
