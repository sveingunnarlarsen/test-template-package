diaText.setTitle(this.getText());

if (isMobile) {
    $('#textLoginDiv').html(modelDataSettings.oData.customizing[0].txtLogin3);
} else {
    $('#textLoginDiv').html(text3);
}

diaText.open();