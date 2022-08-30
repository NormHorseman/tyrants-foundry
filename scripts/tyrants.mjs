import { GiantismHook } from "./giantism-hook.js";
import { DamageCalculator } from "./damageCalculator.js";
import { TyrantsSheet } from "./tyrants-character-sheet.mjs";
import { TyrantsActor } from "./tyrants-actor.js"
import { TyrantsDiceHelpers } from "./tyrants-dice-helper.js";
import SmartRoller from "./smart-roller.js";
import { DivinityData } from "./divinity-data.js";

Hooks.on("init", async () => {
    console.log("Tyrants Module started");

    CONFIG.Actor.documentClass = TyrantsActor;

    Actors.registerSheet("ffg", TyrantsSheet, {
        types: ["character"],
    });


    game.tyrants = {
        TyrantsActor,
        TyrantsDiceHelpers,
        SmartRoller,
        DivinityData,
    };

    let giantismHook = new GiantismHook();
    let damageCalculator = new DamageCalculator();
    game.tyrants.showDamageCalculator = damageCalculator.show;

    await loadTemplates(["modules/tyrants-foundry/templates/tyrants-divinity.html"]);


});



