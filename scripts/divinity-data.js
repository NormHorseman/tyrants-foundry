
export class TYRANTS {
    static ID = 'tyrants-foundry';

    static FLAGS = {
        DIVINITY: 'divinity'
    }

    static DIVINITY = {
        GROWTH: { key: "growth", cost: 6 },
        DESTRUCTION: { key: "destruction", cost: 5 },
        TALENTS: { key: "talents", cost: 2 }
    }

}

export class DivinityData {

    mana = {
        value: 0,
        spent: 0,
    };

    powers = {
        growth: { value: -1, adjusted: 0, spent: 0 },
        destruction: { value: -1, adjusted: 0, spent: 0 },
        talents: { value: -1, adjusted: 0, spent: 0 },
        sizeChange: { value: -1, adjusted: 0, spent: 0 },
        skills:[]
    };

    // get all todos for a given user
    static get(actorId) {
        return game.actors.get(actorId)?.getFlag(TYRANTS.ID, TYRANTS.FLAGS.DIVINITY);
    }

    // create a new todo for a given user
    static create(actorId, divinityData) {
        const newData = {
            ...divinityData,
            id: foundry.utils.randomID(16)
        }
        let flag = TYRANTS.FLAGS.DIVINITY;
        console.log(flag);
        game.actors.get(actorId).setFlag(TYRANTS.ID, flag, newData);
    }

    static addSkill(actorId, skillName) {
        let divinity = this.get(actorId);
        if (!divinity) {
            this.create(actorId, new DivinityData());
            divinity = this.get(actorId);
        }
        divinity.powers.skills.push({ label: skillName, value: -1, adjusted: 0, spent: 0 });
        const updateData = {
            [`flags.tyrants-foundry.divinity.powers.skills`]: divinity.powers.skills,
        };
        game.actors.get(actorId).update(updateData);
    }

    // update a specific todo by id with the provided updateData
    static update(actorId, updateData) { }

    // delete a specific todo by id
    static delete(todoId) { }

}

function GetSkillNames() {
    let skills = JSON.parse(game.settings.get("starwarsffg", "arraySkillList"))[1].skills;
    return Object.keys(skills);
}
