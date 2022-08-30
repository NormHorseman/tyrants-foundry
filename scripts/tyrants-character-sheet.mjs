import { ActorSheetFFG } from "../../../systems/starwarsffg/modules/actors/actor-sheet-ffg.js";
import { TyrantsDiceHelpers } from "./tyrants-dice-helper.js";
import { TYRANTS } from "./divinity-data.js";

export class TyrantsSheet extends ActorSheetFFG {
    constructor(data, context) {
        super(data, context);

    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["starwarsffg", "sheet", "actor"],
            template: "modules/tyrants-foundry/templates/tyrants-character-sheet.html",
            width: 710,
            height: 650,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "characteristics" }],
            scrollY: [".tableWithHeader", ".tab", ".skillsGrid", ".skillsTablesGrid"],
        });
    }

    /** @override */
    get template() {
        return `modules/tyrants-foundry/templates/tyrants-character-sheet.html`;
    }


    activateListeners(html) {
        super.activateListeners(html);

        html
            .find(".roll-button")
            .children()
            .off();
        html
            .find(".roll-button")
            .children()
            .on("click", async (event) => {
                let upgradeType = null;
                if (event.ctrlKey && !event.shiftKey) {
                    upgradeType = "ability";
                } else if (!event.ctrlKey && event.shiftKey) {
                    upgradeType = "difficulty";
                }
                TyrantsDiceHelpers.rollSkill(this, event, upgradeType);

                //Extend DiceHelpers, override rollSkill. THIS IS THE SOLUTION!!!
            });

        this.setDivinityButtons(html, TYRANTS.DIVINITY.GROWTH);
        this.setDivinityButtons(html, TYRANTS.DIVINITY.DESTRUCTION);
        this.setDivinityButtons(html, TYRANTS.DIVINITY.TALENTS);
    }

    setDivinityButtons(html, item) {
        html
            .find(`#increase-${item.key}`)
            .on("click", async (event) => {
                this.increasePower(item);
            });
        html
            .find(`#decrease-${item.key}`)
            .on("click", async (event) => {
                this.decreasePower(item);
            });
    }

    increasePower(item) {
        let actor = this.actor;
        let divinity = actor.getFlag("tyrants-foundry", "divinity");
        let power = divinity.powers[item.key];
        let manaSpent = divinity.mana.spent;
        let powerSpent = power.spent;
        let currentRank = power.value;
        let nextRank = currentRank + 1;
        let cost = nextRank * item.cost;
        if (nextRank == 0) {
            cost = 1;
        }
        let finalSpend = manaSpent + cost;
        let finalPowerSpend = powerSpent + cost;
        const updateData = {
            [`flags.tyrants-foundry.divinity.powers.${item.key}.value`]: nextRank,
            [`flags.tyrants-foundry.divinity.powers.${item.key}.spent`]: finalPowerSpend,
            ['flags.tyrants-foundry.divinity.mana.spent']: finalSpend,
        };
        actor.update(updateData);
        if(item.key==TYRANTS.DIVINITY.GROWTH.key)
            Hooks.call("updateSize", this);
    }

    decreasePower(item) {
        let actor = this.actor;
        let divinity = actor.getFlag("tyrants-foundry", "divinity");
        let power = divinity.powers[item.key];
        let manaSpent = divinity.mana.spent;
        let powerSpent = power.spent;
        let currentRank = power.value;
        let nextRank = currentRank - 1;
        let cost = currentRank * item.cost;
        if (currentRank <= 0) {
            cost = 1;
        }
        let finalSpend = manaSpent - cost;
        let finalPowerSpend = powerSpent - cost;
        if (nextRank >= -1) {
            const updateData = {
                [`flags.tyrants-foundry.divinity.powers.${item.key}.value`]: nextRank,
                [`flags.tyrants-foundry.divinity.powers.${item.key}.spent`]: finalPowerSpend,
                ['flags.tyrants-foundry.divinity.mana.spent']: finalSpend,
            };
            actor.update(updateData);
        }
        if(item.key==TYRANTS.DIVINITY.GROWTH.key)
            Hooks.call("updateSize", this);
    }
}
