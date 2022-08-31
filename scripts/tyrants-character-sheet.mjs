import { ActorSheetFFG } from "../../../systems/starwarsffg/modules/actors/actor-sheet-ffg.js";
import { TyrantsDiceHelpers } from "./tyrants-dice-helper.js";
import { DivinityData, TYRANTS } from "./divinity-data.js";

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

        //Add divine skill
        html
            .find("#add-divine-skill-button")
            .on("click", async (event) => {
                console.log("SKILLS", this.actor);
                let result = {};
                let skills = this.actor.data.data.skills;
                result.skills = skills;
                console.log(skills);
                const myContent = await renderTemplate(`modules/tyrants-foundry/templates/tyrants-add-divine-skill.html`, result);

                const options = {
                    height: 330
                }
                let d = new Dialog({
                    title: "ADD SKILL",
                    content: myContent,
                    buttons: {
                        one: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "OK",
                            actor: this.actor,
                            callback: this.AddSkill
                        },
                    },
                    default: "one",
                    render: html => console.log("Register interactivity in the rendered dialog"),
                    close: html => console.log("This always is logged no matter which option is chosen")
                }, options);
                d.render(true);
            });
        //reset divine skills
        html
            .find(`#divinity-reset-button`)
            .on("click", async (event) => {
                this.actor.unsetFlag(TYRANTS.ID, TYRANTS.FLAGS.DIVINITY);
            });


        this.setDivinityButtons(html, TYRANTS.DIVINITY.GROWTH);
        this.setDivinityButtons(html, TYRANTS.DIVINITY.DESTRUCTION);
        this.setDivinityButtons(html, TYRANTS.DIVINITY.TALENTS);

        let divinity = DivinityData.get(this.actor.id);
        let divineSkills = divinity?.powers?.skills;
        if (divineSkills) {
            for (let i = 0; i < divineSkills.length; i++) {
                let skill = divineSkills[i];
                this.setDivinitySkillButtons(html, skill.label, i, divineSkills);

            }
        }



    }

    AddSkill() {
        console.log("ADD SKILL TRIGGERED!");
        let skill = document.getElementById("divine-skill-select").value;
        console.log("Add Skill:" + skill);
        console.log("THIS", this);
        console.log("ACTOR", this.actor);

        DivinityData.addSkill(this.actor.id, skill);
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

    setDivinitySkillButtons(html, key, index, divineSkills) {
        html
            .find(`#increase-${key}`)
            .on("click", async (event) => {
                this.increaseSkillPower(index, divineSkills);
            });
        html
            .find(`#decrease-${key}`)
            .on("click", async (event) => {
                this.decreaseSkillPower(index, divineSkills);
            });
        html
            .find(`#delete-${key}`)
            .on("click", async (event) => {
                this.deleteSkill(key);
            });

    }

    increaseSkillPower(index, divineSkills) {
        let actor = this.actor;
        let divinity = actor.getFlag("tyrants-foundry", "divinity");
        if (!divinity) {
            DivinityData.create(actor.id, new DivinityData());
        }
        let power = divinity.powers.skills[index];
        let manaSpent = divinity.mana.spent;
        let powerSpent = power.spent;
        let currentRank = power.value;
        let nextRank = currentRank + 1;
        let cost = nextRank * 2;
        if (nextRank == 0) {
            cost = 1;
        }
        let finalSpend = manaSpent + cost;
        let finalPowerSpend = powerSpent + cost;
        divineSkills[index].value = nextRank;
        divineSkills[index].spent = finalPowerSpend;
        const updateData = {
            [`flags.tyrants-foundry.divinity.powers.skills`]: divineSkills,
            ['flags.tyrants-foundry.divinity.mana.spent']: finalSpend,
        };
        actor.update(updateData);
    }

    decreaseSkillPower(index, divineSkills) {
        let actor = this.actor;
        let divinity = actor.getFlag("tyrants-foundry", "divinity");
        if (!divinity) {
            DivinityData.create(actor.id, new DivinityData());
        }
        let power = divinity.powers.skills[index];
        let manaSpent = divinity.mana.spent;
        let powerSpent = power.spent;
        let currentRank = power.value;
        let nextRank = currentRank - 1;
        let cost = currentRank * 2;
        if (currentRank <= 0) {
            cost = 1;
        }
        let finalSpend = manaSpent - cost;
        let finalPowerSpend = powerSpent - cost;
        if (nextRank >= -1) {
            divineSkills[index].value = nextRank;
            divineSkills[index].spent = finalPowerSpend;
            const updateData = {
                [`flags.tyrants-foundry.divinity.powers.skills`]: divineSkills,
                ['flags.tyrants-foundry.divinity.mana.spent']: finalSpend,
            };
            actor.update(updateData);
        }
    }

    deleteSkill(key) {
        let actor = this.actor;
        let divinity = actor.getFlag("tyrants-foundry", "divinity");
        if (!divinity) {
            DivinityData.create(actor.id, new DivinityData());
        }
        let skills = divinity.powers.skills;
        let manaSpent = divinity.mana.spent;
        let newSkills = [];
        let freedMana = 0;
        for (let i = 0; i < skills.length; i++) {
            let skill = skills[i];
            if (skill.label != key) {
                freedMana += skill.spent
                newSkills.push(skill);
            }
        }
        let finalSpend = manaSpent - freedMana;
        const updateData = {
            [`flags.tyrants-foundry.divinity.powers.skills`]: newSkills,
            ['flags.tyrants-foundry.divinity.mana.spent']: finalSpend,
        };
        actor.update(updateData);

    }

    increasePower(item) {
        let actor = this.actor;
        let divinity = actor.getFlag("tyrants-foundry", "divinity");
        if (!divinity) {
            DivinityData.create(actor.id, new DivinityData());
        }
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
        if (item.key == TYRANTS.DIVINITY.GROWTH.key)
            Hooks.call("updateSize", this);
    }

    decreasePower(item) {
        let actor = this.actor;
        let divinity = actor.getFlag("tyrants-foundry", "divinity");
        if (!divinity) {
            DivinityData.create(actor.id, new DivinityData());
            return;
        }
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
        if (item.key == TYRANTS.DIVINITY.GROWTH.key)
            Hooks.call("updateSize", this);
    }
}
