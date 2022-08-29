import { TyrantsActor } from "./tyrants-actor.js";
import { TargetInfo } from "./targetInfo.js";

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
        let targetInfo = new TargetInfo();
        targetInfo.ReadToken(token);
        return targetInfo;
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


                let isSocial = false;
                if (_roll.skillName == "Coercion") {
                    isSocial = true;
                }

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

                let controlled = FindControlled();
                if (itemRange == "Engaged") {
                    targetInfo.distance = 0;
                    targetInfo.rangeName = "Engaged";
                    _dicePool.difficulty = 1;
                    _dicePool.setback = targetInfo.meleeDefense;
                } else {
                    if (controlled) {
                        ({
                            distance: targetInfo.distance,
                            value: targetInfo.rangeValue,
                            name: targetInfo.rangeName
                        } = FindRangeBand(controlled, token));

                        if (!isSocial) {
                            _dicePool.difficulty = targetInfo.rangeValue;
                            _dicePool.setback = targetInfo.rangedDefense;
                        }
                    }
                }
                //Apply Size difference 
                if (controlled) {
                    targetInfo.sizeBonus = CalculateSizeBonus(controlled.data.elevation, elevation);
                    if (!isSocial) {
                        _dicePool.difficulty += targetInfo.sizeBonus;
                        if (_dicePool.difficulty < 0) {
                            _dicePool.difficulty = 0;
                        }
                    }
                }

                if (!isSocial) {
                    _dicePool.upgradeDifficulty(targetInfo.adversary);
                }
                return targetInfo;
            }
        }
    }
}

function CalculateSizeBonus(attackerElevation, targetElevation) {
    let silDiff = attackerElevation - targetElevation;
    let sizeBonus = parseInt(silDiff / 2);
    return Math.clamped(sizeBonus, -5, 5);
}

function FindRangeBand(controlled, token) {
    //Add Targeting Data
    let gridSize = game.scenes?.current?.dimensions?.size
    var dist = Distance(controlled, token);
    let squares = dist / gridSize;
    let result = {};
    result.distance = squares;
    result.value = 1 + parseInt(squares / 6);
    switch (result.value) {
        case 1:
            result.name = "Short";
            break;
        case 2:
            result.name = "Medium";
            break;
        case 3:
            result.name = "Long";
            break;
        case 4:
            result.name = "Extreme";
            break;
        default:
            result.name = "Short";
            break;
    }
    return result;
}

function Distance(controlled, token) {
    let dx = controlled.transform.position._x - token.transform.position._x;
    let dy = controlled.transform.position._y - token.transform.position._y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    return dist;
}
