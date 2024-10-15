function logonLDAP(rec, data) {
    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: '/user/logon/' + data.type + '/' + data.path,
        data: JSON.stringify(rec),
        headers: {
            'login-path': location.pathname,
        },
        success: function (data) {
            location.reload(true);
        },
        error: function (result, status) {
            if (result.status === 401) {
                inLoginName.setValueState('Error');
                inLoginPassword.setValueState('Error');
                sap.m.MessageToast.show(txtWrongUsernamePassword.getText());
            if (result.status === 403) {
                inLoginName.setValueState('Error');
                inLoginPassword.setValueState('Error');
                sap.m.MessageToast.show(txtLockedUser.getText());
            }
            } else {
                if (result.responseJSON) {
                    sap.m.MessageToast.show(result.status + ': ' + result.responseJSON.status);
                } else {
                    sap.m.MessageToast.show(result.status + ': ' + result.statusText);
                }
            }
        }
    });
}