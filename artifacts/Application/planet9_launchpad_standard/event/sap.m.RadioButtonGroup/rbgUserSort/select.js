const selectedIndex = this.getSelectedIndex();
let oSorter;

if (selectedIndex === 0) {
    oSorter = new sap.ui.model.Sorter('lastLogin', true, false);

} else if (selectedIndex === 1) {
    oSorter = new sap.ui.model.Sorter('lastLogin', false, false);

} else if (selectedIndex === 2) {
    oSorter = new sap.ui.model.Sorter('username', true, false);

} else if (selectedIndex === 3) {
    oSorter = new sap.ui.model.Sorter('username', false, false);
}

let binding = AppCacheUsers.getBinding('items');
binding.sort(oSorter);

popUserSort.close();