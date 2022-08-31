
import { WeaponRoll } from "./weapon-roll.js";

export const SizeTalents = ["Giantism", "Massive", "Bonus Silhouette"];

let updateSizeCommandStack=[];


export class GiantismHook {
    constructor() {
        Hooks.on("ffgDiceMessage", async (...args) => {
            let RollFFG = args[0];
            let item = RollFFG.data;
            let ffg = RollFFG.ffg;
            let actor = RollFFG.actor;
            if (item.type == "weapon") {
                await this.showWeaponResult(item, actor, ffg);
            }

        });

        Hooks.on("updateItem", async (item, data, options, id) => {
            if (id == game.userId) {
                await updateTokenSizesFromItem(item);

            }
        });

        Hooks.on("updateSize", async (item, data, options, id) => {
            if (id == game.userId || game.user.isGM) {
                updateSizeCommandStack.push(item)
            }
        });

        Hooks.on("renderActorSheet",async(...args)=>{
            if(updateSizeCommandStack.length>0){
                await updateTokenSizesFromSheet(updateSizeCommandStack.pop());
            }

        });

        Hooks.on("createToken", async (...args) => {
            let token = args[0]
            onCreate(token);
        });
    }



    async showWeaponResult(item, actor, ffg) {
        let skill = item?.data?.skill?.value;
        if (skill == "Coercion") {
            //Show Scathing Tirade
            let result = {};
            result.ffg = ffg;
            const content = await renderTemplate(`modules/tyrants-foundry/templates/scathingTiradeHit.html`, result);
            let message = ChatMessage.create({
                user: game.user._id,
                content: content,
                type: "scathingTiradeHit"
            });

        } else {
            let result = WeaponRoll(item, actor, ffg);
            if (result?.target) {
                const content = await renderTemplate(`modules/tyrants-foundry/templates/targetHit.html`, result);
                let message = ChatMessage.create({
                    user: game.user._id,
                    content: content,
                    type: "giantismTargetHit"
                });
            }
        }

    }
}

async function updateTokenSizesFromSheet(sheet) {
    let actor = sheet.actor;
    let protoToken = actor.data.token
    await actor.update({
        token:
        {
            height: protoToken.height,
            width: protoToken.width
        }
    });
    updateActiveTokens(actor, protoToken);
}

async function updateTokenSizesFromItem(item) {
    //Update Token Size
    if (!SizeTalents.includes(item.name)) {
        return;
    }
    if (item.parent?.type != "character") {
        return;
    }
    let actor = item.parent;
    let protoToken = item.parent.data.token
    await actor.update({
        token:
        {
            height: protoToken.height,
            width: protoToken.width
        }
    });
    updateActiveTokens(actor, protoToken);
}

function updateActiveTokens(actor, protoToken) {
    let silhouette = actor?.data?.data?.stats?.silhouette;
    let updates = [];
    actor.getActiveTokens().forEach(token => {
        console.log(token);
        updates.push({
            _id: token.id,
            height: protoToken.height,
            width: protoToken.width,
            elevation: silhouette
        });
    });
    canvas.scene.updateEmbeddedDocuments("Token", updates);
}

function onCreate(token) {
    let silhouette = token?.actor?.data?.data?.stats?.silhouette;
    if (!silhouette) {
        return;
    }
    token.data.elevation = silhouette;
}

