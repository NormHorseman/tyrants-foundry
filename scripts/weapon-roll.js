import { RollItemModifier } from "./itemModifier-roll.js";
import { FindTarget } from "./target-helper.js";

export function WeaponRoll(_data, _itemParent, _ffg) {
  //Handle Item attack rolls
  CONFIG.logger.debug("TYRANT WEAPON ROLL");
  CONFIG.logger.debug(_data);

  _itemParent = FindActorParent(_itemParent);

  let { hasItemModifiers, itemModifiers, breach } = RollItemModifier(_data);
  _data.itemModifiers = itemModifiers;

  let damage = calculateDamage(_data, _itemParent);
  let damageValue = _data?.data?.damage?.value;
  if (damageValue) {
    damageValue = damage;
  }


  //Handle targets;
  _data.target = CalculateTargetInfo(breach, _itemParent, damage, _ffg);

  return _data;
}

function CalculateTargetInfo(breach, _itemParent, damage, _ffg) {
  let target = null;
  let userTarget = FindTarget()?.document?._actor;
  if (userTarget) {
    target = {};
    target.name = userTarget.name;

    let targetStats = userTarget?.data?.data?.stats;
    if (targetStats) {
      let viewStats = JSON.parse(JSON.stringify(targetStats));
      target.armor = viewStats.armor;
      target.soak = viewStats.soak;
      target.wounds = viewStats.wounds;
      target.strain = viewStats.strain;
      target.strain.original = viewStats.wounds.value;
      target.wounds.original = viewStats.wounds.value;

      let actorId = _itemParent._id;
      if(!actorId){
        actorId = _itemParent.id;
      }
      let giantism = game.actors.get(actorId).items.getName("Giantism");

      let gBreach = parseInt(giantism?.data?.data?.ranks?.current / 4, 10);
      let totalBreach = breach + gBreach;

      let armor = target.armor?.value ? target.armor?.value : 0
      let soak = target.soak.value ? target.soak.value : 0
      let totalSoak = armor + soak;

      totalSoak -= totalBreach;
      totalSoak = Math.max(totalSoak, 0);
      let diceDamage = damage + _ffg.success;

      let massive = userTarget.items?.getName("Massive");
      target.massive = massive?.data?.data?.ranks?.current;

      target.finalDamage = Math.max((diceDamage - totalSoak), 0);
      target.totalBreach = totalBreach;
      target.wounds.value += target.finalDamage;
      target.strain.value += target.finalDamage;
    }
  }
  return target;
}

function GetItems(_itemParent) {
  let items = _itemParent?.items;
  if (items) {
    return items;
  } else {
    return _itemParent?.data?.items;
  }
}

function calculateDamage(_data, _itemParent) {
  let damage = _data?.data?.damage?.adjusted;
  if (damage == 0) {
    damage = _data.data.damage;
  }
  //Don't let brawn weapon damage == 0
  damage = fixZeroDamage(damage, _data, _itemParent);
  return damage;
}

function FindActorParent(_itemParent) {
  try {
    if (!_itemParent) {
      let len = canvas?.tokens?.controlled?.length;
      if (len > 0) {
        let controlled = canvas.tokens.controlled[0].data.document._actor;
        _itemParent = controlled;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return _itemParent;
}

function fixZeroDamage(damage, _data, _itemParent) {
  if (damage == 0) {
    let characteristic = _data?.data?.characteristic;
    if (characteristic == "Brawn") {
      _data.data?.attributes?.some(attribute => {
        if (attribute.mod == "damage") {
          damage += attribute.value;
          damage += _itemParent.data?.data?.attributes?.Brawn?.value;
        }
      });
    }

  }
  return damage;
}
