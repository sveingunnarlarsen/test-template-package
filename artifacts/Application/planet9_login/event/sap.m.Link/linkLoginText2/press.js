diaText.setTitle(this.getText());

if (isMobile) {
    $('#textLoginDiv').html(modelDataSettings.oData.customizing[0].txtLogin2);
} else {
    $('#textLoginDiv').html(text2);
}

diaText.open();