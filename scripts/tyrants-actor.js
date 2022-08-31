import { ActorFFG } from "../../../systems/starwarsffg/modules/actors/actor-ffg.js";

export const SizeTalents = ["Giantism", "Massive", "Bonus Silhouette"];

export class TyrantsActor extends ActorFFG {
    constructor(data, context) {
        super(data, context);

    }

    prepareDerivedData() {
        super.prepareDerivedData();
        const actorData = this.data;
        this.applyGiantism(actorData);
        this.applyDivinity(actorData);
    }

    applyDivinity(actor) {
        let divinity = actor?.flags["tyrants-foundry"]?.divinity;
        let skills = divinity?.powers?.skills;
        if (!skills) {
            return;
        }
        for (let i = 0; i < skills.length; i++) {
            let skill = skills[i];
            let divineRank = skill.value + 1;
            let baseRank = actor.data.skills[skill.label].rank;
            actor.data.skills[skill.label].rank = baseRank + divineRank;
        }

    }

    applyGiantism(actor) {
        if (actor.type == "vehicle") {
            return;
        }
        let divinity = actor.flags["tyrants-foundry"]?.divinity;
        let divineGrowth = divinity?.powers?.growth?.value;
        if (divineGrowth) {
            divineGrowth += 1;
        } else {
            divineGrowth = 0;
        }


        actor.data.stats.silhouette = 1;
        actor.data.stats.silhouette += (divinity?.powers?.growth?.value + 1);
        let map = {};
        for (let i = 0; i < SizeTalents.length; i++) {
            let talent = SizeTalents[i];
            let item = actor?.items?.getName(talent);
            map[talent] = item;
            if (item) {
                actor.data.stats.silhouette += item.data.data.ranks.current
            }
        }

        let giantism = map["Giantism"];
        if (giantism) {
            let ranks = giantism.data.data.ranks.current + divineGrowth;
            let breach = parseInt(ranks / 4, 10);
            let armor = parseInt(ranks / 5, 10);
            actor.data.stats.breach = {};
            actor.data.stats.breach.value = breach;
            actor.data.stats.armor = {};
            actor.data.stats.armor.value = armor;
            actor.data.stats.totalSoak = armor + actor.data.stats.soak.value;
        }
        let massive = map["Massive"];
        if (massive) {
            let ranks = massive.data.data.ranks.current
            actor.data.stats.massive = ranks;
        } else {
            actor.data.stats.massive = 0;
        }
        //Update the token prototype
        let prototypeToken = actor.token;
        let silhouette = actor.data.stats.silhouette;
        if (silhouette > 1) {
            let tileScale = 2 + parseInt(silhouette / 4);
            prototypeToken.height = tileScale;
            prototypeToken.width = tileScale;
            prototypeToken.elevation = silhouette;
        } else {
            prototypeToken.height, prototypeToken.width, prototypeToken.elevation = 1;
        }
    }


}