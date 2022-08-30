import { TYRANTS } from "./divinity-data.js";

export class TargetInfo {
    img; name; wounds; strain; soak; armor; meleeDefense; rangedDefense; magicResist; breach; massive;
    adversary; magicResist; elevation;

    constructor() {

    }

    ReadToken(token) {
        let actor = token.document._actor;
        let actorData = actor.data;
        let elevation = token.data.elevation;
        let talentList = actorData.data.talentList;
        this.elevation = elevation;
        this.name = actor.name;
        this.img = actor.img;
        this.name = actorData.name;
        this.wounds = actorData.data.stats.wounds;
        this.strain = actorData.data.stats.strain;
        this.soak = actorData.data.stats.soak.value;
        this.armor = actorData.data.stats.armor.value;
        this.meleeDefense = actorData.data.stats.defence.melee;
        this.rangedDefense = actorData.data.stats.defence.ranged;
        this.magicResist = 0;
        this.adversary = 0;
        this.breach = actorData.data.stats.breach.value
        this.massive = actorData.data.stats.massive;
        console.log("ACTOR", actor)
        let destruction = actor.getFlag(TYRANTS.ID, TYRANTS.FLAGS.DIVINITY)?.powers?.destruction?.value;
        if (!destruction) {
            destruction = 0;
        }
        this.destruction = destruction;

        if (!this.massive) { this.massive = 0; }

        talentList.forEach(talent => {
            if (talent.name == "Adversary") {
                this.adversary = talent.rank;
            }
            if (talent.name == "Magic Resistance") {
                this.magicResist = talent.rank;
            }
        });
        return this;
    }

    CalculateDamage(itemBreach, damage, controlled) {
        let totalSoak = this.armor + this.soak;
        this.destruction = controlled.destruction;
        this.totalDamage = damage + this.destruction;
        this.totalBreach = itemBreach + controlled.breach;
        totalSoak -= this.totalBreach;
        this.finalDamage = damage - totalSoak;
        this.wounds.original = this.wounds.value;
        this.strain.original = this.strain.value
    }

    CalulateDamageFromItem(damage, totalBreach) {
        let totalSoak = this.armor + this.soak;
        totalSoak -= totalBreach;
        totalSoak = Math.max(totalSoak, 0);
        this.finalDamage = Math.max((damage - totalSoak), 0);
        this.totalBreach = totalBreach;
        this.wounds.original = this.wounds.value;
        this.strain.original = this.strain.value
        this.wounds.value += this.finalDamage;
        this.strain.value += thhis.finalDamage;
    }

}