function setTabIndexOnElm(elm, index) {
    // elm && elm.setAttribute("tabindex", index);
}

function setTabIndex(obj, index) {
    // if (!obj.getVisible()) return;
    // setTabIndexOnElm(obj.getDomRef(), index);
}

function setTabIndexOnItemsRecursively(obj) {
    // obj.getItems &&
    //     obj
    //         .getItems()
    //         .filter((item) => item.getVisible())
    //         .forEach((item) => {
    //             globalTabIndex += 1;
    //             setTabIndex(item, globalTabIndex);
    //             if (item.getItems && item.getItems().length > 0) {
    //                 setTabIndexOnItemsRecursively(item);
    //             }
    //         });
}

function unsetTabIndexOnItemsRecursively(obj) {
    // obj.getItems &&
    //     obj.getItems().forEach((item) => {
    //         setTabIndex(item, -1);
    //         if (item.getItems && item.getItems().length > 0) {
    //             unsetTabIndexOnItemsRecursively(item);
    //         }
    //     });
}

function onKeyPressFocusOnInput(obj) {
    // obj.addEventDelegate({
    //     onkeydown: function (event) {
    //         if (event.key === "Enter") {
    //             obj.focus();
    //         }
    //     },
    // });
}

function setTabIndicesForContentMenu() {
    // if (!launchpadContentMenu.getVisible()) return;

    // if (!sap.n.Layout.isVerticalMenuPinned()) {
    //     launchpadOverflowClickArea.setVisible(true);
    // }
    
    // disableTabIndicesLessThan0();

    // let index = sap.n.Layout.isVerticalMenuPinned() ? 4000 : 0;

    // index += 4;
    // setTabIndex(launchpadOverflowBtn, index);

    // index += 1;
    // setTabIndex(toolVerticalMenuFilter, index);

    // index += 1;
    // setTabIndexOnElm(toolVerticalMenuFilter.getDomRef().querySelector('[type="search"]'), index);

    // index += 1;
    // setTabIndex(toolVerticalMenuExpand, index);

    // index += 1;
    // setTabIndex(toolVerticalMenuCollapse, index);

    // index += 10;
    // globalTabIndex = index;
    // setTabIndicesForOpenApps();

    // index += 25;
    // globalTabIndex = index;
    // setTabIndexOnItemsRecursively(ContentMenu);

    // const refCollapse = toolVerticalMenuCollapse.getDomRef();
    // function onFocusReset() {
    //     refCollapse.removeEventListener("focus", onFocusReset);
    //     setTabIndicesForContentMenu();
    // }
    // refCollapse.removeEventListener("focus", onFocusReset);
    // refCollapse.addEventListener("focus", onFocusReset);

    // const refList = ContentMenu.getDomRef();
    // function onTabReset(event) {
    //     if (event.key === "Tab") {
    //         refList.removeEventListener("keyup", onTabReset);
    //         setTabIndicesForContentMenu();
    //     }
    // }
    // refList.removeEventListener("keyup", onTabReset);
    // refList.addEventListener("keyup", onTabReset);
}

function unsetTabIndicesForOpenApps() {
    // openApps.getItems().forEach((app) => {
    //     app.getItems().forEach((item) => {
    //         setTabIndex(item, -1);
    //     });
    // });
}

function setTabIndicesForOpenApps() {
    // openApps.getItems().forEach((app) => {
    //     // outer opened app
    //     app.getItems().forEach((item) => {
    //         // [app icon, close app button]
    //         setTabIndex(item, globalTabIndex);
    //         globalTabIndex += 1;
    //     });
    // });
}

function unsetTabIndicesForContentMenu() {
    // launchpadOverflowClickArea.setVisible(false);
    // launchpadOverflowContainer.setVisible(false);

    // [
    //     launchpadOverflowBtn,
    //     toolVerticalMenuFilter,
    //     toolVerticalMenuExpand,
    //     toolVerticalMenuCollapse,
    // ].forEach((obj) => setTabIndex(obj, -1));

    // unsetTabIndicesForOpenApps();
    // unsetTabIndexOnItemsRecursively(ContentMenu);

    // if (sap.n.Layout.isVerticalMenuPinned()) {
    //     if (sap.n.Launchpad.isPhone()) {
    //         AppCacheShellLogoMobile.focus()
    //     } else {
    //         AppCacheShellLogoDesktop.focus();
    //     }
    // } else {
    //     AppCacheShellMenu.focus();
    // }
}

// function setTabIndicesForAppCacheListMenu() {
//     setTabIndex(AppCacheShellUser, -1);

//     launchpadSettings.addStyleClass("nepLaunchpadMenuSettingsOpen");
//     launchpadSettingsContainer.setVisible(true);
//     launchpadSettingsClickArea.setVisible(true);

//     setTimeout(() => {
//         disableTabIndicesLessThan0();
//         setTabIndex(launchpadSettingsBtn, 10000);
//         launchpadSettingsBtn.focus();

//         globalTabIndex = 10010;
//         const firstVisibleItem = AppCacheListMenu.getItems().find(item => item.getVisible());
//         if (firstVisibleItem) {
//             setTabIndex(firstVisibleItem, globalTabIndex);
//         }
//     }, 100);
// }

// function unsetTabIndicesForAppCacheListMenu() {
//     setTabIndex(AppCacheShellUser, 4000);

//     launchpadSettingsContainer.setVisible(false);
//     launchpadSettingsClickArea.setVisible(false);
//     launchpadSettings.removeStyleClass("nepLaunchpadMenuSettingsOpen");

//     unsetTabIndexOnItemsRecursively(AppCacheListMenu);
// }

// function setTabIndexesOnApps() {
//     const content = AppCacheNav.getCurrentPage().getContent();
//     if (content.length > 0) {
//         globalTabIndex = 5000;
//         for (const section of content) {
//             if (!section.getItems) continue;

//             for (const grid of section.getItems()) {
//                 if (!grid.getItems) continue;

//                 for (const card of grid.getItems()) {
//                     if (card.hasStyleClass("nepFCardContainer")) {
//                         globalTabIndex += 1;
//                         setTabIndex(card, globalTabIndex);

//                         if (!card.getItems()) continue;

//                         for (const cardItem of card.getItems()) {
//                             // customizations related buttons
//                             if (!sap.n.Customization.isActive) {
//                                 if (cardItem.hasStyleClass("nepDeleteCard")) continue;
//                                 if (cardItem.hasStyleClass("nepFCardAdd")) continue;
//                             }

//                             if (cardItem.getContent) {
//                                 const content = cardItem.getContent();
//                                 if (!content.getItems) continue;

//                                 for (const contentItem of content.getItems()) {
//                                     if (!contentItem.getItems) continue;

//                                     const items = contentItem.getItems();
//                                     for (const actionContainer of items) {
//                                         if (!actionContainer.hasStyleClass("nepActionContainer"))
//                                             continue;
//                                         if (!actionContainer.getItems) continue;

//                                         for (const actionItem of actionContainer.getItems()) {
//                                             if (
//                                                 !actionItem.getVisible() ||
//                                                 !actionItem.hasStyleClass("nepTileAction")
//                                             )
//                                                 continue;
//                                             setTabIndex(actionItem, globalTabIndex);
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     }
// }

function disableTabIndicesLessThan0() {
    // Array.from(document.querySelectorAll("[tabindex]"))
    //     .map((e) => [e, parseInt(e.getAttribute("tabindex"))])
    //     .filter(([_, tabindex]) => tabindex === 0)
    //     .forEach(([e]) => e.setAttribute("tabindex", -1));
}

function onKeyDownInContentMenu(event) {
    // if (event.which === 9) {
    //     setTimeout(() => {
    //         if (!launchpadContentMenu.getDomRef().contains(document.activeElement)) {
    //             Array.from(ContentMenu.getDomRef().querySelectorAll('[tabindex]'))
    //                 .map((e) => [e, parseInt(e.getAttribute("tabindex"))])
    //                 .filter(([_, tabindex]) => tabindex === 0)
    //                 .forEach(([e]) => e.setAttribute("tabindex", -1));
                
    //             const elm = launchpadContentMenu.getDomRef();
    //             if (elm) {
    //                 elm.removeEventListener('keydown', onKeyDownInContentMenu);
    //             }
    //         }
    //     }, 250);
    // }
}

// ui5 sets tabindex for some elements from -1 to 0
// which interrupts tab flow
function detectContentMenuBlurForTabIndexReset() {
    // const elm = launchpadContentMenu.getDomRef();
    // if (elm) {
    //     elm.removeEventListener('keydown', onKeyDownInContentMenu);
    //     elm.addEventListener('keydown', onKeyDownInContentMenu);
    // }
}

function setTabIndices() {
    // // App Navigation
    // if (sap.n.Layout.isVerticalMenuPinned()) {
    //     setTabIndex(AppCacheShellMenu, -1);
    // } else {
    //     setTabIndex(AppCacheShellMenu, 1);
    // }

    // unsetTabIndicesForContentMenu();
    // if (sap.n.Layout.isVerticalMenuPinned()) {
    //     setTabIndicesForContentMenu();
    // }

    // // Logo
    // setTabIndex(AppCacheShellLogoDesktop, 2000);
    // setTabIndex(AppCacheShellLogoMobile, 2000);

    // // App Back Button
    // setTabIndex(AppCacheBackButton, 2001);

    // // Top Menu
    // globalTabIndex = 2005;
    // setTabIndexOnItemsRecursively(AppCacheAppButton);

    // // User Menu
    // setTabIndex(AppCacheShellUser, 4000);
    // // TODO Disable tabbing into right sidebar menu, unless you open the right sidebar menu
    // unsetTabIndicesForAppCacheListMenu();

    // // Apps
    // setTabIndexesOnApps();
    // setTabIndex(AppCachePageSideTab, -1);

    // disableTabIndicesLessThan0();

    // // Content Menu
    // detectContentMenuBlurForTabIndexReset();
}

// AppCacheNav.onAfterRendering = () => {
//     setTabIndices();
// };

// AppCacheNav.attachAfterNavigate(() => {
//     setTabIndices();
// });

window.addEventListener("keyup", (event) => {
    
    if (AppCacheNav.getCurrentPage() === AppCache_boxPasscodeEntry) {

        if (event.code.indexOf("Digit") === 0 || event.code.indexOf("Numpad") === 0) {
            NumPad.enterKey(event.key);

        } else if (event.key === "Backspace" || event.key === "Delete") {
            NumPad.Clear();

        } else if (event.key === "Escape") {
            NumPad.Clear();
            sap.n.Launchpad.settingsMenuClose();
            AppCache.Lock();
        }

    } else if (event.key === "Escape") {
        // left-side bar menu"
        if (launchpadOverflowContainer.getVisible()) {
            launchpadOverflowBtn.firePress();
        }

        // right-side settings menu
        if (launchpadSettingsContainer.getVisible()) {
            launchpadSettingsBtn.firePress();
        }
    }
});
