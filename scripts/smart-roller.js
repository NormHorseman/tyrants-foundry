
import { TyrantsDiceHelpers } from "./tyrants-dice-helper.js";
import { DicePoolFFG } from "../../../systems/starwarsffg/modules/dice-pool-ffg.js";
import { ComputeRoll } from "./target-helper.js";

export default class SmartRoller {
    static async rollItem(item, actor, flavorText, sound) {
        const itemData = item.data;
        await item.setFlag("starwarsffg", "uuid", item.uuid);

        const status = TyrantsDiceHelpers.getWeaponStatus(itemData);

        const skill = actor.data.data.skills[itemData.data.skill.value];
        const characteristic = actor.data.data.characteristics[skill.characteristic];

        let dicePool = new DicePoolFFG({
            ability: Math.max(characteristic.value, skill.rank),
            boost: skill.boost,
            setback: skill.setback + status.setback,
            force: skill.force,
            advantage: skill.advantage,
            dark: skill.dark,
            light: skill.light,
            failure: skill.failure,
            threat: skill.threat,
            success: skill.success,
            triumph: skill?.triumph ? skill.triumph : 0,
            despair: skill?.despair ? skill.despair : 0,
            difficulty: 2 + status.difficulty, // default to average difficulty
        });
        dicePool.upgrade(Math.min(characteristic.value, skill.rank));
        dicePool = new DicePoolFFG(await TyrantsDiceHelpers.getModifiers(dicePool, itemData));
        let roll = {
            data: actor,
            skillName: skill.label,
            item: itemData,
            sound: sound,
            flavor: flavorText,
        };
        actor.targetInfo = ComputeRoll(roll, dicePool);
        TyrantsDiceHelpers.displayRollDialog(actor, dicePool, `${game.i18n.localize("SWFFG.Rolling")} ${skill.label}`, skill.label, itemData, flavorText, sound);
    }
}