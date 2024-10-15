
const CustomizationStorage = {
    formatTile: function(tile) {
        return {
            id: tile.id,
            status: "active",
            props: {},
            isCustom: false,
        };
    },

    formatTiles: function(tiles) {
        return tiles.map(this.formatTile);
    },

    formatTileGroup: function(tilegroup) {
        return {
            id: tilegroup.id,
            status: "active",
            props: {},
            isCustom: false,
            tiles: this.formatTiles(tilegroup.tiles),
            tilegroups: tilegroup.tilegroups.map((tg) => ({
                id: tg.id,
                status: "active",
                props: {},
                isCustom: false,
            })),
        };
    },

    formatCategory: function(selected, data) {
        return {
            id: selected.id,
            status: "active",
            props: {},
            isCustom: false,
            tiles: this.formatTiles(selected.tiles),
            tilegroups: selected.tilegroups
                .map((tilegroup) => {
                    let tg = data.categoryChilds.find((child) => child.id === tilegroup.id);
                    if (tg) return this.formatTileGroup(tg);

                    tg = data.category.find((category) => category.id === tilegroup.id);
                    if (tg) return this.formatTileGroup(tg);

                    return null
                })
                .filter((tilegroup) => tilegroup !== null),
        };
    },

    formatCategories: function(data) {
        return data.category.map((c) => this.formatCategory(c, data));
    },

    // convert list of objects to [{ id }]
    arrToIds: function(arr) {
        return arr.map((item) => item.id);
    },

    // get new category/tilegroup/tile from what are available
    // current = current list of category/tilegroup/tile in customization
    // available = available list of category/tilegroup/tile from p9 backend
    newFromAvailable: function(current, available, src) {
        const currentIds = this.arrToIds(current);
        const availableIds = this.arrToIds(available);
        const newIds = availableIds.filter((id) => !currentIds.includes(id));
        return newIds
            .map((newId) => src.find(({ id }) => id === newId))
            .filter((item) => item !== undefined);
    },

    // check if user has access category/tilegroup/tile
    // current = current list of category/tilegroup/tile in customization
    // available = available list of category/tilegroup/tile from p9 backend
    filterByAccess: function(current, available) {
        const availableIds = this.arrToIds(available);
        return current.filter((item) => {
            if (item.isCustom) return true;
            return availableIds.includes(item.id);
        });
    },

    // group can be a category or a tilegroup
    mergeTiles: function(type, group, data) {
        group.tiles = this.filterByAccess(group.tiles, data.tiles);

        // add new tiles
        let groupData = null;
        if (type === "category")
            groupData = data.category.find((category) => category.id === group.id);
        else if (type === "tilegroup")
            groupData = data.categoryChilds.find((tilegroup) => tilegroup.id === group.id);

        if (groupData) {
            const newTiles = this.newFromAvailable(group.tiles, groupData.tiles, data.tiles);
            if (newTiles.length === 0) return;

            newTiles.forEach((tile) => {
                // find tile position relative to original position inside the tiles list
                // try to place tile on that particular position
                const placeAt = groupData.tiles.findIndex((groupTile) => groupTile.id === tile.id)
                const formatted = this.formatTile(tile);

                // if we are able to find a position to place the tile, then place the tile
                // otherwise just push it the end
                if (placeAt > -1) {
                    group.tiles.splice(placeAt, 0, formatted);
                } else {
                    group.tiles.push(formatted);
                }
            });
        }
    },

    mergeTileGroups: function(category, data) {
        category.tilegroups = this.filterByAccess(category.tilegroups, data.categoryChilds);

        // add new tilegroups
        const categoryData = data.category.find((cat) => cat.id === category.id);
        if (categoryData) {
            const newTileGroups = this.newFromAvailable(category.tilegroups, categoryData.tilegroups, data.categoryChilds);

            if (newTileGroups.length > 0) {
                newTileGroups.forEach((newTileGroup) => {
                    const placeAt = categoryData.tilegroups.findIndex((tileGroup) => tileGroup.id === newTileGroup.id)
                    const formatted = this.formatTileGroup(newTileGroup);

                    if (placeAt > -1) {
                        category.tilegroups.splice(placeAt, 0, formatted);
                    } else {
                        category.tilegroups.push(formatted);
                    }
                });
            }
        }

        // merge tiles in tilegroup
        for (const tilegroup of category.tilegroups) {
            this.mergeTiles("tilegroup", tilegroup, data);
        }
    },

    mergeCategories: function(existing, data) {
        existing.categories = this.filterByAccess(existing.categories, data.category);

        for (const category of existing.categories) {
            this.mergeTileGroups(category, data);
            this.mergeTiles("category", category, data);
        }

        // add newly added categories
        const newCategories = this.newFromAvailable(
            existing.categories,
            data.category,
            data.category
        );
        newCategories.forEach((newCategory) => {
            const placeAt = data.category.findIndex((cat) => cat.id === newCategory.id);
            const formatted = this.formatCategory(newCategory, data);

            if (placeAt > -1) {
                existing.categories.splice(placeAt, 0, formatted);
            } else {
                existing.categories.push(formatted);
            }
        });
    },

    merge: function(existing, data) {
        this.mergeCategories(existing, data);
    },
};