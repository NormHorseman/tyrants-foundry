export function FindTarget() {
    let target = null;

    try {
        if (game.user.targets) {
            let iter = game.user.targets.entries();
            let nextItem = iter.next()
            if (nextItem.value) {
                target = nextItem.value[0];
            }
        }
    } catch (exception) {
        console.error(exception);
        return target;
    }
    return target;
}

export function FindControlled() {
    let controlled = canvas.tokens.controlled?.entries()?.next();
    if (controlled) {
        let controlledValue = controlled.value;
        if (controlledValue) {
            return controlledValue[1]
        }
    }
}

export function ReadTargetData(token) {
    if (token) {
        let target = token.document._actor;
        let elevation = token.data.elevation;
        let targetInfo = null;
        if (target) {
            targetInfo = {};
            targetInfo.elevation = elevation;
            let actorData = target.data;
            let talentList = actorData.data.talentList;
            targetInfo.img = target.img;
            targetInfo.name = actorData.name;
            targetInfo.wounds = actorData.data.stats.wounds;
            targetInfo.strain = actorData.data.stats.strain;
            targetInfo.soak = actorData.data.stats.soak.value;
            targetInfo.armor = actorData.data.stats.armor.value;
            targetInfo.meleeDefense = actorData.data.stats.defence.melee;
            targetInfo.rangedDefense = actorData.data.stats.defence.ranged;
            targetInfo.magicResist = 0;
            targetInfo.adversary = 0;
            targetInfo.breach = actorData.data.stats.breach.value
            targetInfo.massive = actorData.data.stats.massive;
            if (!targetInfo.massive) { targetInfo.massive = 0; }

            talentList.forEach(talent => {
                if (talent.name == "Adversary") {
                    targetInfo.adversary = talent.rank;
                }
                if (talent.name == "Magic Resistance") {
                    targetInfo.magicResist = talent.rank;
                }
                if (talent.name == "Massive") {
                    targetInfo.massive = talent.rank;
                }
            });
            return targetInfo;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

export function ComputeRoll(_roll, _dicePool) {
    //Add Weapon data
    if (_roll.item) {
        let itemRange = _roll.item?.data?.range?.value;
        let token = FindTarget();
        if (token) {
            let target = token.document._actor;
            let elevation = token.data.elevation;
            let targetInfo = null;
            if (target) {
                targetInfo = {};
                targetInfo.elevation = elevation;
                let actorData = target.data;
                let talentList = actorData.data.talentList;
                targetInfo.img = target.img;
                targetInfo.name = actorData.name;
                targetInfo.meleeDefense = actorData.data.stats.defence.melee;
                targetInfo.rangedDefense = actorData.data.stats.defence.ranged;
                targetInfo.magicResist = 0;
                targetInfo.adversary = 0;

                talentList.forEach(talent => {
                    if (talent.name == "Adversary") {
                        targetInfo.adversary = talent.rank;
                    }
                    if (talent.name == "Magic Resistance") {
                        targetInfo.magicResist = talent.rank;
                    }
                    if (talent.name == "Massive") {
                        targetInfo.massive = talent.rank;
                    }

                    let controlled = FindControlled();

                    if (itemRange == "Engaged") {
                        targetInfo.distance = 0;
                        targetInfo.rangeName = "Engaged";
                        _dicePool.difficulty = 1;
                        _dicePool.setback = targetInfo.meleeDefense;
                    } else {
                        if (controlled) {
                            //Apply Distance
                            targetInfo.rangeValue = ApplyDistanceDifficulty(controlled, token, targetInfo, _dicePool);
                        }
                    }
                    //Apply Size difference 
                    if (controlled) {
                        let myElevation = controlled.data.elevation;
                        let silDiff = myElevation - elevation;
                        let sizeBonus = parseInt(silDiff / 2);
                        sizeBonus = Math.clamped(sizeBonus, -5, 5);
                        targetInfo.sizeBonus = sizeBonus;

                        _dicePool.difficulty += sizeBonus;
                        if (_dicePool.difficulty < 0) {
                            _dicePool.difficulty = 0;
                        }
                    }
                })
                _dicePool.upgradeDifficulty(targetInfo.adversary);
                return targetInfo;
            }
        }
    }
}

function ApplyDistanceDifficulty(controlled, token, targetInfo, _dicePool) {
    //Add Targeting Data
    let gridSize = game.scenes?.current?.dimensions?.size
    var dist = Distance(controlled, token);
    let squares = dist / gridSize;
    targetInfo.distance = squares;
    targetInfo.rangeValue = 1 + parseInt(squares / 6);
    switch (targetInfo.rangeValue) {
        case 1:
            _dicePool.difficulty = 1;
            _dicePool.setback = targetInfo.rangedDefense;
            targetInfo.rangeName = "Short";
            break;
        case 2:
            _dicePool.difficulty = 2;
            _dicePool.setback = targetInfo.rangedDefense;
            targetInfo.rangeName = "Medium";
            break;
        case 3:
            _dicePool.difficulty = 3;
            _dicePool.setback = targetInfo.rangedDefense;
            targetInfo.rangeName = "Long";
            break;
        case 4:
            _dicePool.difficulty = 3;
            _dicePool.setback = targetInfo.rangedDefense;
            targetInfo.rangeName = "Extreme";
            break;
        default:
            _dicePool.difficulty = 1;
            targetInfo.rangeName = "Short";
            _dicePool.setback = targetInfo.rangedDefense;
            break;
    }
}

function Distance(controlled, token) {
    let dx = controlled.transform.position._x - token.transform.position._x;
    let dy = controlled.transform.position._y - token.transform.position._y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    return dist;
}
