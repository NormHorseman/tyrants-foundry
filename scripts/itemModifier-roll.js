export function RollItemModifier(_data) {
    let itemModifiers = {};
    let breach = 0;
    try {

        if (_data.data?.itemmodifier) {

            if (_data.data.adjusteditemmodifier) {
                itemModifiers = _data.data.adjusteditemmodifier
                itemModifiers.forEach(item => {
                    item.displayRank = item.data.rank_current;
                    if (item.name == "Breach Quality") {
                        breach = item.displayRank;
                    }
                });
            } else {
                itemModifiers = _data.data.itemmodifier;
                itemModifiers.forEach(item => {
                    item.displayRank = item.data.rank;
                    if (item.name == "Breach Quality") {
                        breach = item.displayRank;
                    }
                });
            }
            return { hasItemModifiers: true, itemModifiers: itemModifiers, breach: breach };
        }

    } catch (e) {
        console.error(e);
    }
    return { hasItemModifiers: false, itemModifiers: null };

}


