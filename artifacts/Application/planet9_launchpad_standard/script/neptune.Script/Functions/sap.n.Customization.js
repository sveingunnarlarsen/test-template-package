sap.n.Customization = {
    isActive: false, // buttons to customize screens is active / inactive
    tilesDragDropClass: "nepTileSortable",
    tileSelectors: new Set(),
    editHomeTimeout: {},
    resize: {
        height: -1,
        width: -1,
        rows: -1,
        columns: -1,
    },
};

// if customization are not enabled per device by default we will use 'default' as the device name
sap.n.Customization.getDeviceType = function () {
    return this.isDeviceBased() ? sap.n.Launchpad.deviceType() : "default";
};

sap.n.Customization.isEmpty = function (obj) {
    return Object.keys(obj).length === 0;
};

sap.n.Customization.isInitialized = function () {
    return !this.isEmpty(this.getCustomizationsFor(this.getDeviceType()));
};

sap.n.Customization.setActivation = function (visible) {
    this.isActive = visible;
    if (visible) {
        this.jiggle();
    }
};

sap.n.Customization.isDeviceBased = function () {
    return AppCache.config && AppCache.config.enableDeviceBasedCustomizations === true;
};

sap.n.Customization.areScreensLocked = function () {
    const { lockScreenChanges } = modelAppCacheDiaSettings.getData();
    return !!lockScreenChanges;
};

sap.n.Customization.isUserAnonymous = function () {
    return (
        AppCache &&
        AppCache.userInfo &&
        AppCache.userInfo.username &&
        AppCache.userInfo.username === "anonymous"
    );
};

sap.n.Customization.areExplicitlyDisabled = function () {
    return AppCache.config && AppCache.config.disableCustomizations === true;
};

sap.n.Customization.isEnabled = function () {
    return !sap.n.Customization.isDisabled();
};

// force disabled, otherwise existing launchpads would break
sap.n.Customization.isDisabled = function () {
    if (this.areExplicitlyDisabled()) return true;

    if (!this.isSupported()) return true;

    // anonymous user is not logged in, and has random public access to the launchpad
    // so saving customizations for such user is not useful
    if (this.isUserAnonymous()) return true;

    // public launchpads are used by everyone in the same standard way
    // so customizations are disabled
    if (AppCache.isPublic) return true;

    // view standard screens
    const { disableScreenChanges } = modelAppCacheDiaSettings.getData();
    if (disableScreenChanges) return true;

    return false;
};

sap.n.Customization.addCustomizableClass = function () {
    querySelector("html").classList.add("lp-is-customizable");
};

sap.n.Customization.removeCustomizableClass = function () {
    querySelector("html").classList.remove("lp-is-customizable");
};

sap.n.Customization.initOffline = function () {
    if (!this.isDisabled()) {
        this.addCustomizableClass();
    }

    return Promise.resolve();
};

sap.n.Customization.init = function (data) {
    if (this.isDisabled()) {
        this.setCustomizationsInContext(this.formatForStorage(data));
        return Promise.resolve();
    }

    this.addCustomizableClass();

    if (this.isInitialized()) {
        CustomizationStorage.merge(this.getCustomizationsInContext(), data);
        this.save();
        return Promise.resolve();
    }

    return new Promise((resolve, _reject) => {
        this.fetchFromP9()
            .then((customizations) => {
                if (customizations && !this.isEmpty(customizations)) {
                    // update from server
                    this.setCustomizationsInContext(customizations);
                    CustomizationStorage.merge(this.getCustomizationsInContext(), data);
                } else {
                    // initiate based on current launchpad settings
                    this.setCustomizationsInContext(this.formatForStorage(data));
                }

                this.save();
            })
            .finally(() => {
                resolve();
            });
    });
};

sap.n.Customization.getCustomizations = function () {
    return modelAppCacheCustomization.getData();
};

sap.n.Customization.getCustomizationsFor = function (deviceType) {
    const data = this.getCustomizations()[deviceType];
    if (!data || this.isEmpty(data)) return {};
    return data;
};

sap.n.Customization.getCustomizationsInContext = function () {
    return this.getCustomizationsFor(this.getDeviceType());
};

sap.n.Customization.setCustomizationsFor = function (deviceType, customizations) {
    const data = this.getCustomizations();
    data[deviceType] = customizations;
    modelAppCacheCustomization.setData(data);
};

sap.n.Customization.setCustomizationsInContext = function (customizations) {
    this.setCustomizationsFor(this.getDeviceType(), customizations);
};

sap.n.Customization.saveToLocal = function () {
    setCacheAppCacheCustomization();
};

// customizations are only supported for 21-lts onwards, with 22-lts offering backend storage
sap.n.Customization.isSupported = function () {
    return parseInt(AppCache.p9Version.split(".")[0]) >= 21;
};

// we only support storing customization from 22-LTS onwards
sap.n.Customization.isP9Supported = function () {
    if (!AppCache.p9Version) return false;
    return parseInt(AppCache.p9Version.split(".")[0]) >= 22;
};

sap.n.Customization.getP9URL = function (deviceType) {
    return `${AppCache.Url}/api/launchpad_customizations/${AppCache.launchpadID}/${deviceType}`;
};

sap.n.Customization.fetchFromP9 = function () {
    if (!this.isP9Supported()) return Promise.resolve({});

    // make a call to p9 to fetch customizations for device
    return new Promise((resolve, _reject) => {
        jsonRequest({
            type: "GET",
            url: this.getP9URL(this.getDeviceType()),
        }).then((res) => {
            if (this.isEmpty(res)) {
                return resolve({});
            }

            return resolve(res["config"]);
        });
    });
};

sap.n.Customization.saveToP9 = function () {
    if (!this.isP9Supported()) return;

    if (refreshingAuth) {
        setTimeout(() => {
            this.saveToP9();
        }, 100);
        return;
    }

    const deviceType = this.getDeviceType();
    return jsonRequest({
        type: "POST",
        url: this.getP9URL(deviceType),
        data: JSON.stringify({
            config: this.getCustomizationsFor(deviceType),
        }),
    });
};

sap.n.Customization.removeFromP9 = function () {
    if (!this.isP9Supported()) return;

    const deviceType = this.getDeviceType();
    return jsonRequest({
        type: "DELETE",
        url: this.getP9URL(deviceType),
    });
};

sap.n.Customization.clearCustomizations = function () {
    this.setCustomizationsInContext(null);
    this.saveToLocal();
    return this.removeFromP9();
};

sap.n.Customization.formatForStorage = function (data) {
    return {
        categories: CustomizationStorage.formatCategories(data),
    };
};

sap.n.Customization.save = function () {
    this.saveToLocal();
    this.saveToP9();
};

// give the id (uuid) of a Category/TileGroup/Tile find it's path only search within category if provided status = active/inactive/'', empty = don't filter on status
sap.n.Customization.findPath = function (id, status = "") {
    const customizations = this.getCustomizationsInContext();
    if (this.isEmpty(customizations)) return;

    const categories = customizations.categories.filter((category) => {
        if (status === "") return true;
        return category.status === status;
    });

    for (const { id: categoryId, tiles, tilegroups } of categories) {
        if (id === categoryId) return { type: "category", path: [categoryId] };

        for (const { id: tileId } of tiles) {
            if (id === tileId) return { type: "tile", path: [categoryId, tileId] };
        }

        for (const { id: tileGroupId, tiles } of tilegroups) {
            if (id === tileGroupId) return { type: "tilegroup", path: [categoryId, tileGroupId] };

            for (const { id: tileId } of tiles) {
                if (id === tileId) return { type: "tile", path: [categoryId, tileGroupId, tileId] };
            }
        }
    }
};

// find item the list [{ id }]
sap.n.Customization.findInList = function (id, list) {
    const item = list.find((item) => item.id === id);
    if (item) return [item, list, list.findIndex((item) => item.id === id)];
    return [null, list, -1];
};

// returns item for the last uuid in uuids array, and the array inside which the item exists
// returning
//      [null, message, -1] not found, message will clarify the reason
//      [null, list, -1]    not found, in the list
//      [item, list, index] item was found, in the list
// status can be active/inactive, on removal status becomes inactive
sap.n.Customization.find = function (uuids, status = "active") {
    const customizations = this.getCustomizationsInContext();
    if (this.isEmpty(customizations)) return [null, "customization is not initialized", -1];

    function itemStatusCheck(item) {
        // if item exists and status to find is '' then it exists
        if (item && status === "") return true;
        return item && item.status === status;
    }

    let found;
    const level = uuids.length;
    if (level === 1) {
        found = this.findInList(uuids[0], customizations.categories);
        if (itemStatusCheck(found[0])) return found;
        return [null, "category does not exist", -1];
    } else if (level === 2) {
        const [category, categories] = this.find([uuids[0]]);
        if (!category) return [null, categories, -1];

        // at the level 2, item exists in either a tile or  tilegroup

        found = this.findInList(uuids[1], category.tiles);
        if (itemStatusCheck(found[0])) return found;

        found = this.findInList(uuids[1], category.tilegroups);
        if (itemStatusCheck(found[0])) return found;

        return [null, "does not exist in tile or tile group", -1];
    } else if (level === 3) {
        found = this.find([uuids[0], uuids[1]]);

        // if tilegroup does not exist, or
        if (!found[0]) return [null, found[1], -1];

        // if tilegroup does not have tiles (which means uuids[1] probably refers to a tile) so we won't be able to use uuid[2] further to find the actual match
        if (found[0] && !found[0].tiles)
            return [null, "unable to use the 3rd uuid to find further", -1];

        // TileGroup > TileGroup > Tile. at this last-level we are only looking for a tile
        found = this.findInList(uuids[2], found[0].tiles);
        if (itemStatusCheck(found[0])) return found;

        return [null, "tile does not exist in TileGroup > TileGroup", -1];
    }

    // should never get here, if it does we return not found
    return [null, "we do not know where to look", -1];
};

// type can be T=TILE or TG=TILE_GROUP add item to index, uuids is destination path
sap.n.Customization.add = function (type, item, index, uuids = []) {
    // on move the item status might be removed
    item.status = "active";

    // if no uuid then add it to categories
    if (uuids.length === 0) {
        if (type === "TG") {
            const customizations = this.getCustomizationsInContext();
            const [category, _, categoryIndex] = this.findInList(
                item.id,
                customizations.categories
            );

            if (category) customizations.categories.splice(categoryIndex, 1);
            customizations.categories.splice(index, 0, item);
            this.save();
        }
        return;
    }

    // get the item on the uuids path, add to that item to category or tilegroups at the specified index
    let [found] = this.find(uuids, "active");
    if (!found) return;

    if (type === "TG") {
        const [tilegroup, _, tilegroupIndex] = this.findInList(item.id, found.tilegroups);

        if (tilegroup) found.tilegroups.splice(tilegroupIndex, 1);
        found.tilegroups.splice(index, 0, item);
    } else if (type === "T") {
        const [tile, _, tileIndex] = this.findInList(item.id, found.tiles);
        if (tile) found.tiles.splice(tileIndex, 1);
        found.tiles.splice(index, 0, item);
    }

    this.save();
};

sap.n.Customization.remove = function (uuids) {
    let [found, list, index] = this.find(uuids);
    if (!found) return;

    found.status = "inactive";

    // custom items can be removed
    if (found.isCustom) {
        list.splice(index, 1);
    }

    this.save();
};

// only useful for calculating then next index when moving a Category/Tile/TileGroup within it's own list
sap.n.Customization.moveToIndex = function (current, next) {
    return current === 0 || next === 0 || next + 1 >= current ? next : next - 1;
};

// is moving inside categories, tilegroups or within it's parent group
sap.n.Customization.isSrcEqualToDst = function (src, dst) {
    const srcLen = src.length;
    const dstLen = dst.length;

    if (srcLen === 1 && dstLen === 0) {
        // moving category inside categories
        return true;
    } else if (srcLen === 2 && dstLen === 1 && src[0] === dst[0]) {
        // moving tile group inside category or tile inside category
        return true;
    } else if (srcLen === 3 && dstLen === 2 && src[0] === dst[0] && src[1] === dst[1]) {
        // moving tile inside tilegroup
        return true;
    }

    return false;
};

// an array of from/to consisting of UUID's defining the location to move from/to
// e.g. src: [tile_group_id, tile_id], dst: [tile_group_id, tile_group_id, tile_id]
//      src: Tile Group > Tile
//      dst: Tile Group > Tile Group > Tile at (position 2)
sap.n.Customization.move = function (type, src, dst, index) {
    let [item, _list, currentIndex] = this.find(src);
    if (!item) return;

    if (this.isSrcEqualToDst(src, dst)) {
        if (index === currentIndex) return;
        index = this.moveToIndex(currentIndex, index);
    }

    this.remove(src);
    this.add(type, JSON.parse(JSON.stringify(item)), index, dst);
};

// categories, tilegroups, tiles in an array, based on status
sap.n.Customization.filterByStatus = function (item, status) {
    return item !== undefined && item.status === status;
};

sap.n.Customization.filterByActiveStatus = function (item) {
    if (typeof item.status === "undefined") return true;
    return this.filterByStatus(item, "active");
};

sap.n.Customization.getCategory = function (categoryId) {
    const category = ModelData.FindFirst(AppCacheCategory, "id", categoryId);
    if (category) {
        return Object.assign({}, JSON.parse(JSON.stringify(category)), {
            status: "active",
        });
    }

    return this.getCategories().find((category) => category.id === categoryId);
};

sap.n.Customization.getAllCategories = function () {
    if (this.isDisabled()) {
        return modelAppCacheCategory.getData();
    }

    const { categories } = this.getCustomizationsInContext();
    return categories
        .map((category) => {
            if (category.isCustom) return category;
            return Object.assign({}, this.getCategory(category.id), {
                status: category.status,
            });
        })
        .filter((category) => typeof category !== "undefined");
};

sap.n.Customization.getCategories = function () {
    const { categories } = this.getCustomizationsInContext();
    if (!Array.isArray(categories)) {
        return modelAppCacheCategory
            .getData()
            .map((c) => Object.assign({}, JSON.parse(JSON.stringify(c))), {
                status: "active",
            });
    }

    return categories
        .filter((category) => this.filterByActiveStatus(category))
        .map((category) => {
            if (category.isCustom) {
                return category;
            }

            const categoryData = ModelData.FindFirst(AppCacheCategory, "id", category.id);
            if (!categoryData) return;

            return Object.assign({}, categoryData, {
                status: "active",
            });
        })
        .filter((category) => typeof category !== "undefined");
};

sap.n.Customization.getTileGroup = function (tileGroupId) {
    return ModelData.FindFirst(AppCacheCategoryChild, "id", tileGroupId);
};

sap.n.Customization.getTileGroups = function (id, isFav = false) {
    if (this.isDisabled() || isFav) {
        const category = ModelData.FindFirst(AppCacheCategory, "id", id);
        if (category) return category.tilegroups;
    }

    const result = this.findPath(id);
    if (result === undefined) {
        // exceptional case: tiles groups referenced from a tile group, which is linked as an action from a launchpad tile
        // but that tile group is not included as part of standard tile groups in the launchpad
        const tilegroup = sap.n.Customization.getTileGroup(id);
        if (Array.isArray(tilegroup.tilegroups) && tilegroup.tilegroups.length > 0) {
            return tilegroup.tilegroups;
        }

        return [];
    }

    const { path } = this.findPath(id);
    if (path.length === 0) return [];

    const [item] = this.find(path);
    if (!item) return [];

    const { tilegroups } = item;
    return tilegroups
        .filter((tileGroup) => this.filterByActiveStatus(tileGroup))
        .map((tileGroup) => this.getTileGroup(tileGroup.id))
        .filter((tileGroup) => typeof tileGroup !== "undefined");
};

sap.n.Customization.getTile = function (tileId) {
    return ModelData.FindFirst(AppCacheTiles, "id", tileId);
};

sap.n.Customization.getTiles = function (id, isFav = false) {
    if (this.isDisabled() || isFav) {
        const category = ModelData.FindFirst(AppCacheCategory, "id", id);
        if (category) return category.tiles;

        const childCategory = ModelData.FindFirst(AppCacheCategoryChild, "id", id);
        if (childCategory) return childCategory.tiles;
    }

    const result = this.findPath(id);
    if (result === undefined || result.path.length === 0) {
        // if we are fetching tiles for tile group, but get nothing
        // it "might" be a referenced from a Tile itself as action. But,
        // the tiles inside it are not included directly as part of the launchpad
        const tileGroup = sap.n.Customization.getTileGroup(id);
        if (Array.isArray(tileGroup.tiles) && tileGroup.tiles.length > 0) {
            return tileGroup.tiles;
        }

        return [];
    }

    const [item] = this.find(result.path);
    if (!item) return [];

    const { tiles } = item;
    return tiles
        .filter((tile) => this.filterByActiveStatus(tile))
        .map((tile) => this.getTile(tile.id))
        .filter((tile) => typeof tile !== "undefined");
};

sap.n.Customization.jiggleElement = function () {
    return querySelector("html");
};

sap.n.Customization.jiggle = function () {
    this.jiggleElement().classList.add("jiggle");
    this.jiggleElement().classList.add("jiggleScreen");
    this.jiggleElement().classList.add("jiggleTileCreate");
    this.jiggleElement().classList.add("jiggleTileMove");
};

sap.n.Customization.isJiggling = function () {
    return this.jiggleElement().classList.contains("jiggle");
};

sap.n.Customization.stopJiggling = function () {
    this.setActivation(false);
    this.jiggleElement().classList.remove("jiggle");
    this.jiggleElement().classList.remove("jiggleScreen");
    this.jiggleElement().classList.remove("jiggleTileCreate");
    this.jiggleElement().classList.remove("jiggleTileMove");
    sap.n.Launchpad.BuildTreeMenu();
};

sap.n.Customization.checkToStopJigglingOnMouseDown = function (e) {
    if (!sap.n.Customization.isJiggling()) return;

    let el = e.target;

    // check if mousedown has occurred inside the AppCacheNav
    let inContext = false;
    while (el) {
        if (el.id === "AppCacheNav") {
            inContext = true;
            break;
        }

        el = el.parentNode;
    }

    if (!inContext) return;

    // check if event was recieved by nepFCardContainer or one of it's children
    const clsCardContainer = "nepFCardContainer";
    const clsNewCard = "nepFCardAdd";
    el = e.target;
    while (
        el &&
        el.classList &&
        !el.classList.contains(clsCardContainer) &&
        !el.classList.contains(clsNewCard)
    ) {
        el = el.parentNode;
    }

    // event was not recieved on the Edit Screen interactive element
    if (
        !el ||
        !el.classList ||
        (!el.classList.contains(clsCardContainer) && !el.classList.contains(clsNewCard))
    ) {
        sap.n.Customization.stopJiggling();
    }
};

sap.n.Customization.findTileIndex = function (tileId, parentElm) {
    return Array.from(parentElm.querySelectorAll(".nepFCardContainer")).findIndex((tileElm) => {
        return tileElm.dataset.tileId === tileId;
    });
};

sap.n.Customization.findTileElement = function (elm) {
    for (let parent = elm; parent; parent = parent.parentNode) {
        const ds = parent.dataset;
        if (ds.context && ds.context === "tile") {
            return parent;
        }
    }

    return null;
};

sap.n.Customization.findTileDragContext = function (tileId, tileElm) {
    const index = this.findTileIndex(tileId, tileElm.parentNode);

    for (let parent = tileElm.parentNode; parent; parent = parent.parentNode) {
        const ds = parent.dataset;
        if (ds.context) {
            const context = ds.context;

            if (context === "page" || context === "category-tiles") {
                return {
                    index,
                    tileId,
                    context,
                    parent: [ds.categoryId],
                };
            } else if (context === "tilegroup-tiles") {
                return {
                    index,
                    tileId,
                    context,
                    parent: [ds.categoryId, ds.tilegroupId],
                };
            }
        }
    }
    return null;
};

sap.n.Customization.applyDragDropToTiles = function (pageCat) {
    if (this.isDisabled()) return;

    const element = $(`#${pageCat.getId()}`);

    element.sortable({
        forceHelperSize: true,
        tolerance: "pointer",
        revert: 25,
        opacity: 0.5,
        placeholder: "nepDragPlaceholder",
        forcePlaceholderSize: true,
        items: ".nepFCardSortable",
        connectWith: ".nepGrid",
        scroll: true,
        scrollSpeed: 60,
        helper: "clone",
        handle: ".nepTileSortable",
        over: (event, ui) => {},
        start: (event, ui) => {
            const elm = ui.item.get(0);
            if (!elm) return;

            const tileId = elm.dataset.tileId;
            if (!tileId) return;

            src = this.findTileDragContext(tileId, elm);
        },
        beforeStop: (event, ui) => {},
        stop: (event, ui) => {
            const elm = ui.item.get(0);
            if (!elm) return;

            const tileId = elm.dataset.tileId;
            if (!tileId) return;

            dst = this.findTileDragContext(tileId, elm);

            // moving tiles within category / tilegroup
            if (src.parent.join("") === dst.parent.join("")) {
                dst.index = sap.n.Customization.moveToIndex(src.index, dst.index);
            }

            sap.n.Customization.move("T", [...src.parent, src.tileId], dst.parent, dst.index);
        },
    });
};

sap.n.Customization.setCardSize = function (elm, width, height) {
    if (!elm) return;

    elm.classList.remove(
        ...["Small", "Medium", "Wide", "Wider", "Max", "Tall", "Tower", "Skyscraper"].map(
            (v) => `nepTile${v}`
        )
    );

    elm.classList.add(`nepTile${width ?? "Small"}`);
    if (height) elm.classList.add(`nepTile${height}`);
};

sap.n.Customization.showManagePagesDialog = function () {
    modelManagePages.setData(
        sap.n.Customization.getAllCategories().map((c) => ({
            id: c.id,
            status: c.status,
            isCustom: !!c.isCustom,
            title: c.isCustom ? c.props.menuText : c.title,
        }))
    );

    diaManagePages.open();
};

sap.n.Customization.showAddPageDialog = function () {
    modelPageForm.setData({
        menuText: "New Screen",
        title: "New Screen Title",
        subTitle: "",
    });
    diaPage.open();
};

sap.n.Customization.addPage = function (props) {
    const id = ModelData.genID();
    const customizations = this.getCustomizationsInContext();
    this.add(
        "TG",
        {
            props,
            id,
            isCustom: true,
            tilegroups: [],
            tiles: [],
        },
        customizations.categories.length
    );
    sap.n.Launchpad.BuildMenuTop();
    location.hash = `neptopmenu&${id}`;

    // activate edit screen, on creating a new screen
    this.setActivation(true);
    this.jiggle();

    // open add new app dialog
    this.onAddTile([id]);
};

sap.n.Customization.setPage = function (props) {
    const categoryId = props.id;
    const { menuText, title, subTitle } = props;
    this.saveProperties([categoryId], { menuText, title, subTitle });

    const pageCat = sap.ui.getCore().byId(`page${categoryId}`);
    if (pageCat) pageCat.destroy();

    const category = this.getCategory(categoryId);
    if (category) sap.n.Launchpad.BuildTiles(category);

    sap.n.Launchpad.BuildMenuTop();
};

sap.n.Customization.onAddTile = function (parent) {
    const [obj, _list, index] = sap.n.Customization.find(parent);
    if (index === -1) return;

    const activeTileIds = obj.tiles
        .filter((tile) => sap.n.Customization.filterByActiveStatus(tile))
        .map((tile) => tile.id);
    const missingTiles = modelAppCacheTiles
        .getData()
        .filter((tile) => !activeTileIds.includes(tile.id));

    modelAddTiles.setData(
        missingTiles.map((tile) => ({
            parent,
            id: tile.id,
            title: tile.title,
            subTitle: tile.subTitle,
            visible: true,
        }))
    );
    diaAddTile.open();
};

// path to where page/tilegroup/tile exists
// props can be anything from { width, height } to complete information about the page/tilegroup/tile
sap.n.Customization.saveProperties = function (path, props) {
    let [found] = this.find(path);
    if (!found) return;

    found.props = props;
    this.save();
};

sap.n.Customization.getProperties = function (path) {
    let [found] = this.find(path);
    if (!found) return false;
    return found.props;
};

sap.n.Customization.removeStyleClasses = (direction) => {
    if (direction === "width") {
        sap.n.Customization.resizeContainer.removeStyleClass(
            "nepTileSkinny nepTileNarrow nepTileSmall nepTileMedium nepTileWide nepTileWider nepTileMax"
        );
    } else if (direction === "height") {
        sap.n.Customization.resizeContainer.removeStyleClass(
            "nepTileTiny nepTileShort nepTileNormal nepTileTall nepTileTower nepTileSkyscraper"
        );
    }
};

sap.n.Customization.addStyleClass = (styleClass) => {
    sap.n.Customization.resizeContainer.addStyleClass(styleClass);
};

sap.n.Customization.setTileState = (config) => {

    const tileId = config.tileId;
    const card = config.card;
    const cardContainer = config.cardContainer;

    let path = null;
    for (let parent = cardContainer.getDomRef(); parent; parent = parent.parentNode) {
        const ds = parent.dataset;
        if (!ds || !ds.context) continue;

        if (ds.context === "page" || ds.context === "category-tiles") {
            path = [ds.categoryId, tileId];
            break;
        } else if (ds.context === "tilegroup-tiles") {
            path = [ds.categoryId, ds.tilegroupId, tileId];
            break;
        }
    }

    this.active = false;
    this.context = {
        config: null,
        x1: -1,
        y1: -1,
        x2: -1,
        y2: -1,
        initialWidth: -1,
        initialHeight: -1,
    };
    
    const dataTile = (Array.isArray(modelAppCacheTiles.oData) && modelAppCacheTiles.oData.find((obj) => obj.id === tileId)) || {
        id: tileId,
    };

    let tileWidth = "";
    let tileHeight = "";
    const container = $("#" + sap.n.Customization.resizeContainer.getId());

    if (container.hasClass("nepTileSkinny") && dataTile.cardWidth !== sap.n.Layout.SKINNY) {
        tileWidth = sap.n.Layout.SKINNY;

    } else if (container.hasClass("nepTileNarrow") && dataTile.cardWidth !== sap.n.Layout.tileWidth.NARROW) {
        tileWidth = sap.n.Layout.tileWidth.NARROW;

    } else if (container.hasClass("nepTileSmall") && dataTile.cardWidth !== sap.n.Layout.tileWidth.SMALL) {
        tileWidth = sap.n.Layout.tileWidth.SMALL;

    } else if (container.hasClass("nepTileMedium") && dataTile.cardWidth !== sap.n.Layout.tileWidth.MEDIUM) {
        tileWidth = sap.n.Layout.tileWidth.MEDIUM;

    } else if (container.hasClass("nepTileWide") && dataTile.cardWidth !== sap.n.Layout.tileWidth.WIDE ) {
        tileWidth = sap.n.Layout.tileWidth.WIDE;

    } else if (container.hasClass("nepTileWider") && dataTile.cardWidth !== sap.n.Layout.tileWidth.WIDER) {
        tileWidth = sap.n.Layout.tileWidth.WIDER;

    } else if (container.hasClass("nepTileMax") && dataTile.cardWidth !== sap.n.Layout.tileWidth.MAX) {
        tileWidth = sap.n.Layout.tileWidth.MAX;
    }

    if (container.hasClass("nepTileTiny") && dataTile.cardHeight !== sap.n.Layout.tileHeight.TINY) {
        tileHeight = sap.n.Layout.tileHeight.TINY;

    } else if (container.hasClass("nepTileShort") && dataTile.cardHeight !== sap.n.Layout.tileHeight.SHORT) {
        tileHeight = sap.n.Layout.tileHeight.SHORT;

    } else if (container.hasClass("nepTileNormal") && dataTile.cardHeight !== sap.n.Layout.tileHeight.NORMAL) {
        tileHeight = sap.n.Layout.tileHeight.NORMAL;

    } else if (container.hasClass("nepTileTall") && dataTile.cardHeight !== sap.n.Layout.tileHeight.TALL) {
        tileHeight = sap.n.Layout.tileHeight.TALL;

    } else if (container.hasClass("nepTileTower") && dataTile.cardHeight !== sap.n.Layout.tileHeight.TOWER) {
        tileHeight = sap.n.Layout.tileHeight.TOWER;

    } else if (container.hasClass("nepTileSkyscraper") && dataTile.cardHeight !== sap.n.Layout.tileHeight.SKYSCRAPER) {
        tileHeight = sap.n.Layout.tileHeight.SKYSCRAPER;
    }

    if (path) {
        sap.n.Customization.saveProperties(path, {
            width: tileWidth,
            height: tileHeight,
        });
    }
};