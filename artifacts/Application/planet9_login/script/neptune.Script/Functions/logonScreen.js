let logonScreen = {
    smtpVerified: false,
    isExternal: false,
    sapData: undefined,

    showForm: function(form) {
        formLogin.setVisible(false);
        formForgot.setVisible(false);
        formNewPassword.setVisible(false);

        if (form === `login`) {
            formLogin.setVisible(true);
            AppCacheShellTitle.setText(`Logon`);

        } else if (form === `forgotPassword`) {
            formForgot.setVisible(true);
            AppCacheShellTitle.setText(`Forgot Password`);

        } else if (form === `newPassword`) {
            formNewPassword.setVisible(true);
            AppCacheShellTitle.setText(`New Password`);
        }
        
    },

    getLogonTypes: function () {
        let query = "";

        // From Browser
        if (location.pathname.toLowerCase().indexOf("/launchpad/") > -1) {
            let path = location.pathname.split("/");
            query = "?launchpad=" + path[path.length - 1];
        }

        $.ajax({
            type: "GET",
            url: "/user/logon/types" + query,
            success: function (data) {
                logonScreen.setSettings(data);
            },
            error: function (result, status) {},
        });
    },

    setSettings: function (data) {

        data.logonTypes.sort(sort_by("name", false));
        logonScreen.smtpVerified = data.showForgotPassword;

        // External Registration of Users
        if (data.launchpadIsExternal) logonScreen.isExternal = true;

        // Logon Types
        let idps = [];

        // Add Local Login
        if (!data.disableLocalAuth) {
            inLoginTypes.addItem(
                new sap.ui.core.Item({
                    key: "local",
                    text: "Local",
                })
            );
        }

        // Add Other Login
        data.logonTypes.forEach(function (item) {
            if (!item.show) return;

            switch (item.type) {
                case "saml":
                case "ldap":
                case "azure-bearer":
                case "oauth2":
                case "openid-connect":
                case "sap":
                    logonScreen.addFormLogon(item);
                    break;
            }
        });

        // Set Default Selected
        let selectedLoginType = localStorage.getItem("selectedLoginType");
        if (selectedLoginType === "local" && data.disableLocalAuth) {
            selectedLoginType = undefined;
        }

        if (data.defaultLoginIDP) {
            data.logonTypes.forEach(function (item) {
                if (data.defaultLoginIDP === item.id) inLoginTypes.setSelectedKey(item.id);
            });
        } else if (selectedLoginType) {
            inLoginTypes.setSelectedKey(selectedLoginType);
        } else {
            if (data.disableLocalAuth) {
                inLoginTypes.setSelectedItem(inLoginTypes.getItems()[0]);
            } else {
                inLoginTypes.setSelectedKey("local");
            }
        }

        // Set hide/show username/password
        logonScreen.setInputFields();

        // Get System Name/Description
        if (data.settings.name) {
            txtLoginSubTitle1.setText(data.settings.name);
            txtFormForgotSubTitle1.setText(data.settings.name);
        }
        if (data.settings.description){
            txtLoginSubTitle2.setText(data.settings.description);
            txtFormForgotSubTitle2.setText(data.settings.description);
        }

        // Launchpad Config
        if (data.settingsLaunchpad && data.settingsLaunchpad.config) {
            if (data.settingsLaunchpad.config.hideLoginSelection) inLoginTypes.setVisible(false);
            if (data.settingsLaunchpad.config.loginTitle)
                txtLoginSubTitle1.setText(data.settingsLaunchpad.config.loginTitle);
            if (data.settingsLaunchpad.config.loginSubTitle)
                txtLoginSubTitle2.setText(data.settingsLaunchpad.config.loginSubTitle);
        }

        // Background Image
        if (Array.isArray(data.customizing) && data.customizing.length) {
            const customizing = data.customizing[0];
            if (customizing.loginImage) {
                document.documentElement.style.setProperty(
                    "--customBackgroundImage",
                    "url(" + customizing.loginImage + ")"
                );
                const pageDomRef = pageShell.getDomRef();
                pageDomRef.classList.remove("nepNavigationPage");
                pageDomRef.classList.add("nepCustomBackground");
            }

            if (customizing.topIcon) {
                var link = document.querySelector("link[rel='shortcut icon']");
                if (!link) {
                    link = document.createElement("link");
                    link.rel = "icon";
                    document.head.appendChild(link);
                }
                link.href = customizing.topIcon;
            }

            // Background Color
            setTimeout(function () {
                if (customizing.loginBackgroundColor) {
                    let style = document.createElement("style");
                    style.innerHTML =
                        ".nepPanLogon { background-color: " +
                        customizing.loginBackgroundColor +
                        " !important}" +
                        ".sapUiTheme-neptune_horizon_dark .nepPanLogon { background-color: " +
                        customizing.loginBackgroundColor +
                        " !important}" +
                        document.head.appendChild(style);
                }
            }, 200);

            // Texts
            if (customizing.txtLogin1Enable) {
                AppCache_boxLogonLink.setVisible(true);
                linkLoginText1.setText(customizing.txtLogin1Label);
                linkLoginText1.setVisible(true);
                text1 = customizing.txtLogin1;
            }

            if (customizing.txtLogin2Enable) {
                AppCache_boxLogonLink.setVisible(true);
                linkLoginText2.setText(customizing.txtLogin2Label);
                linkLoginText2.setVisible(true);
                linkLoginSep1.setVisible(true);
                text2 = customizing.txtLogin2;
            }

            if (customizing.txtLogin3Enable) {
                AppCache_boxLogonLink.setVisible(true);
                linkLoginText3.setText(customizing.txtLogin3Label);
                linkLoginText3.setVisible(true);
                linkLoginSep2.setVisible(true);
                text3 = customizing.txtLogin3;
            }
        }

        // Call Custom Settings
        setSettingsCustom(data);
    },

    setInputFields: function () {
        let logonid = inLoginTypes.getSelectedKey() || "local";

        localStorage.setItem("selectedLoginType", logonid);

        linkCode.setVisible(false);
        linkSep.setVisible(false);
        linkLogoff.setVisible(false);
        linkSep1.setVisible(false);
        linkForgot.setVisible(false);

        // Logon local
        if (logonid === "local" || logonid == "sap") {
            inLoginName.setVisible(true);
            inLoginPassword.setVisible(true);
            if (logonScreen.isExternal) linkCode.setVisible(true);
            if (logonScreen.smtpVerified && !isMobile) linkForgot.setVisible(true);
            localStorage.removeItem("p9logonData");
            return;
        }

        // Logon others
        let logonType = ModelData.FindFirst(formLogons, "id", logonid);
        localStorage.setItem("p9logonData", JSON.stringify(logonType));

        switch (logonType.type) {
            case "azure-bearer":
            case "openid-connect":
                linkLogoff.setVisible(true);
                inLoginName.setVisible(false);
                inLoginPassword.setVisible(false);
                break;

            case "saml":
                inLoginName.setVisible(false);
                inLoginPassword.setVisible(false);
                break;

            case "oauth2":
                inLoginName.setVisible(false);
                inLoginPassword.setVisible(false);
                break;

            default:
                inLoginName.setVisible(true);
                inLoginPassword.setVisible(true);
                break;
        }
        if (linkCode.getVisible() && linkLogoff.getVisible()) {
            linkSep.setVisible(true);
        }
        if (linkLogoff.getVisible() && linkForgot.getVisible()) {
            linkSep1.setVisible(true);
        }
        if (linkCode.getVisible() && linkForgot.getVisible()) {
            linkSep.setVisible(true);
        }
    },

    addFormLogon: function (data) {
        formLogons.push(data);

        inLoginTypes.addItem(
            new sap.ui.core.Item({
                key: data.id,
                text: data.name,
            })
        );

        inLoginTypes.setVisible(true);
    },

    requestActivationCode: function (rec) {
        const url = isMobile ? AppCache.Url : "";
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: url + "/user/activation",
            data: JSON.stringify(rec),
            success: function (data) {
                jQuery.sap.require("sap.m.MessageToast");
                sap.m.MessageToast.show(data.status);
            },
            error: function (result, status) {
                jQuery.sap.require("sap.m.MessageToast");
                sap.m.MessageToast.show(result.responseJSON.status);
            },
        });
    },

    forgotPassword: function () {
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/user/forgot/generate",
            data: JSON.stringify({
                username: inForgotUsername.getValue().toLowerCase(),
            }),
            success: function (data) {
                sap.m.MessageToast.show(
                    "A password reset link has been sent to the email address connected with the account"
                );
                setTimeout(function () {
                    logonScreen.showForm(`login`);
                }, 300);
            },
        });
    },

    resetSapPassword: function ({ detail, path }) {
        if (inNewPassword.getValue() !== inNewPassword2.getValue()) {
            sap.m.MessageToast.show("Password confirmation doesn't match password");
        } else if (!inNewPassword.getValue()) {
            sap.m.MessageToast.show("Please provide a password");
        } else {
            appShell.setBusy(true);
            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: `/user/logon/sap/${path}`,
                data: JSON.stringify({
                    detail,
                    password: inNewPassword.getValue(),
                }),
                success: function (data) {
                    appShell.setBusy(false);
                    if (data.status === "UpdatePassword") {
                        jQuery.sap.require("sap.m.MessageToast");
                        sap.m.MessageToast.show(data.message);
                        inNewPassword.setValueState("Error");
                        inNewPassword2.setValueState("Error");
                    } else {
                        logonScreen.sapData = undefined;
                        location.reload();
                    }
                },
                error: function (result, status) {
                    appShell.setBusy(false);

                    jQuery.sap.require("sap.m.MessageBox");
                    sap.m.MessageBox.show(result.responseJSON.status, {
                        title: "Error",
                        icon: "ERROR",
                        actions: ["CLOSE"],
                        onClose: function () {},
                    });

                    inNewPassword.setValueState("Error");
                    inNewPassword2.setValueState("Error");
                },
            });
        }
    },

    resetPassword: function () {
        if (logonScreen.sapData) {
            return logonScreen.resetSapPassword(logonScreen.sapData);
        }

        const url = new URL(location.href);
        const token = url.searchParams.get("token");

        if (inNewPassword.getValue() !== inNewPassword2.getValue()) {
            sap.m.MessageToast.show("Password confirmation doesn't match password");
        } else if (!inNewPassword.getValue()) {
            sap.m.MessageToast.show("Please provide a password");
        } else {
            appShell.setBusy(true);
            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: "/user/forgot/reset",
                data: JSON.stringify({
                    token,
                    password: inNewPassword.getValue(),
                }),
                success: function (data) {
                    appShell.setBusy(false);
                    sap.m.MessageToast.show("Password updated");

                    setTimeout(function () {
                        logonScreen.showForm(`login`);
                        window.history.pushState(
                            {},
                            document.title,
                            location.href.split("?token=")[0]
                        );
                    }, 500);
                },
                error: function (result, status) {
                    appShell.setBusy(false);

                    jQuery.sap.require("sap.m.MessageBox");
                    sap.m.MessageBox.show(result.responseJSON.status, {
                        title: "Error",
                        icon: "ERROR",
                        actions: ["CLOSE"],
                        onClose: function () {},
                    });

                    inNewPassword.setValueState("Error");
                    inNewPassword2.setValueState("Error");
                },
            });
        }
    },
};
