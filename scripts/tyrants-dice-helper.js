import DiceHelpers from "../../../systems/starwarsffg/modules/helpers/dice-helpers.js";
import { DicePoolFFG } from "../../../systems/starwarsffg/modules/dice-pool-ffg.js";
import { ComputeRoll } from "./target-helper.js";

export class TyrantsDiceHelpers extends DiceHelpers {
    constructor(data, context) {
        super(data, context);

    }

    static async rollSkill(obj, event, type, flavorText, sound) {
        const data = obj.getData();
        console.log("ROLL TYRANTS SKILL")
        console.log(obj);
        console.log(data);
        const row = event.target.parentElement.parentElement;
        let skillName = row.parentElement.dataset["ability"];
        if (skillName === undefined) {
            skillName = row.dataset["ability"];
        }

        let skills;
        const theme = await game.settings.get("starwarsffg", "skilltheme");
        try {
            skills = JSON.parse(JSON.stringify(CONFIG.FFG.alternateskilllists.find((list) => list.id === theme).skills));
        } catch (err) {
            // if we run into an error use the default starwars skill set
            skills = JSON.parse(JSON.stringify(CONFIG.FFG.alternateskilllists.find((list) => list.id === "starwars").skills));
            CONFIG.logger.warn(`Unable to load skill theme ${theme}, defaulting to starwars skill theme`, err);
        }

        let skillData = skills?.[skillName];

        if (!skillData) {
            skillData = data.data[skillName];
        }

        let skill = {
            rank: 0,
            characteristic: "",
            boost: 0,
            setback: 0,
            force: 0,
            advantage: 0,
            dark: 0,
            light: 0,
            failure: 0,
            threat: 0,
            success: 0,
            triumph: 0,
            despair: 0,
            label: skillData?.label ? game.i18n.localize(skillData.label) : game.i18n.localize(skillName),
        };
        let characteristic = {
            value: 0,
        };

        if (data?.data?.skills?.[skillName]) {
            skill = data.data.skills[skillName];
        }
        if (data?.data?.characteristics?.[skill?.characteristic]) {
            characteristic = data.data.characteristics[skill.characteristic];
        }

        const actor = await game.actors.get(data.actor._id);

        // Determine if this roll is triggered by an item.
        let item;
        if ($(row.parentElement).hasClass("item")) {
            //Check if token is linked to actor
            if (obj.actor.token === null) {
                let itemID = row.parentElement.dataset["itemId"];
                item = actor.items.get(itemID);
            } else {
                //Rolls this if unlinked
                let itemID = row.parentElement.dataset["itemId"];
                item = obj.actor.token.actor.items.get(itemID);
            }
        }
        const itemData = item?.data || {};
        const status = this.getWeaponStatus(itemData);

        // TODO: Get weapon specific modifiers from itemmodifiers and itemattachments

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
            triumph: skill.triumph,
            despair: skill.despair,
            difficulty: 2 + status.difficulty, // default to average difficulty
        });

        dicePool.upgrade(Math.min(characteristic.value, skill.rank));

        if (type === "ability") {
            dicePool.upgrade();
        } else if (type === "difficulty") {
            dicePool.upgradeDifficulty();
        }

        dicePool = new DicePoolFFG(await this.getModifiers(dicePool, itemData));
        let roll = {
            data: data,
            skillName: skill.label,
            item: itemData,
            sound: sound,
            flavor: flavorText,
        };
        data.targetInfo = ComputeRoll(roll, dicePool);

        this.displayRollDialog(data, dicePool, `${game.i18n.localize("SWFFG.Rolling")} ${game.i18n.localize(skill.label)}`, skill.label, itemData, flavorText, sound);
    }
}