import { ActorSheetFFG } from "../../../systems/starwarsffg/modules/actors/actor-sheet-ffg.js";
import { TyrantsDiceHelpers } from "./tyrants-dice-helper.js";

export class TyrantsSheet extends ActorSheetFFG {
    constructor(data, context) {
        super(data, context);

    }

    getData(options) {
        const data = super.getData();
        data.smelloWorld = "SMELLO WORLD"
        //Call compute roll here?
        return data;
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
    }
}
