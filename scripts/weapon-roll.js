import { ActorFFG } from "../../../systems/starwarsffg/modules/actors/actor-ffg.js";
import { TyrantsActor } from "./tyrants-actor.js";
import { RollItemModifier } from "./itemModifier-roll.js";
import { FindTarget } from "./target-helper.js";
import { Pick, Value } from "./tools.js";
import { TYRANTS } from "./divinity-data.js";

export function WeaponRoll(_data, _itemParent, _ffg) {
  //Handle Item attack rolls

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

      let parentActorId = Pick(_itemParent?._id, _itemParent.id);
      let targetActorId = Pick(userTarget.id, userTarget._id);
      let parentActor = game.actors.get(parentActorId);
      let targetActor = game.actors.get(targetActorId);

      let totalBreach = breach + GetGiantismBreach(parentActor);
      let armor = Value(target?.armor?.value);
      let soak = Value(target?.soak?.value);
      let totalSoak = armor + soak;
      totalSoak -= totalBreach;
      totalSoak = Math.max(totalSoak, 0)
      console.log(parentActor);
      let destruction = parentActor.getFlag(TYRANTS.ID, TYRANTS.FLAGS.DIVINITY)?.powers?.destruction?.value;
      if (!destruction) {
        destruction = 0;
      }
      target.totalDamage = damage + _ffg.success + Math.max(destruction, 0);
      target.destruction = destruction;
      target.finalDamage = Math.max((target.totalDamage - totalSoak), 0);
      target.totalBreach = totalBreach;
      target.wounds.value += target.finalDamage;
      target.strain.value += target.finalDamage;
      target.massive = GetTalentRanks(targetActor, "Massive");
    }
  }
  return target;
}



function GetGiantismBreach(actor) {
  let talentRanks = GetTalentRanks(actor, "Giantism");
  return Math.trunc(talentRanks / 4);
}

function GetTalentRanks(actor, talentName) {
  let talent = actor.items.getName(talentName);
  return talent?.data?.data?.ranks?.current;
}

function calculateDamage(_data, _itemParent) {
  let damage = Pick(_data?.data?.damage?.adjusted, _data?.data?.damage);
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