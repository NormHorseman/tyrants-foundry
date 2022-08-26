import { FindControlled, FindTarget, ReadTargetData } from "./target-helper.js";

export class DamageCalculator {
    constructor() {
    }

    async show() {
        let targetToken = FindTarget();
        let controlledToken = FindControlled();
        let result = {};
        result.targetInfo = ReadTargetData(targetToken);
        result.controlledInfo = ReadTargetData(controlledToken);

        if (result.targetInfo) {
            const options = {
                height:330
            }
            const html = await renderTemplate(`modules/tyrants-foundry/templates/damage-calculator.html`, result);

            let d = new Dialog({
                title: "Damage Calculator",
                content: html,
                buttons: {
                    one: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "To Wounds",
                        callback: ToWounds
                    },
                    two: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "To Strain",
                        callback: ToStrain
                    },
                },
                default: "one",
                render: html => console.log("Register interactivity in the rendered dialog"),
                close: html => console.log("This always is logged no matter which option is chosen")
            },options);
            d.render(true);
        }


    }
}


async function ToWounds(){
    WriteCalulate(false);
}

async function ToStrain(){
    WriteCalulate(true);
}

async function WriteCalulate(toStrain) {
    let damage = parseInt(document.getElementById("damageInput").value);
    let itemBreach = parseInt(document.getElementById("breachInput").value);

    let targetToken = FindTarget();
    let controlledToken = FindControlled();
    let result = {};
    result.damage = damage;
    result.target = ReadTargetData(targetToken);
    result.controlled = ReadTargetData(controlledToken);

    if (result?.target) {
        let target = result?.target;
        let totalSoak = target.armor + target.soak;
        target.totalBreach = itemBreach + result.controlled.breach;
        totalSoak -= target.totalBreach;
        target.finalDamage = damage - totalSoak;
        target.wounds.original = target.wounds.value;
        target.strain.original = target.strain.value
        if (toStrain) {
            target.strain.value += target.finalDamage;
        } else {
            target.wounds.value += target.finalDamage;
        }

        const myHtml = await renderTemplate(`modules/tyrants-foundry/templates/damage-calculator-result.html`, result);
        ChatMessage.create({
            user: game.user._id,
            content: myHtml
        });
    }
}
