import items_game from "./data/items_game.json";
import csgo_english from "./data/csgo_english.json";
import prices from "./data/latest.json";
import is from "./data/images.json";

const images = is as Record<string, string>;

import { CSGOItem, Item, ItemType, MinimalItem } from "@betterinv/types";
// --- 1) Load schema + localization (needs your Steam Web API key)
function loadItemsGame() {
    return items_game;
}

function loadLocalization(lang = "english") {
    return csgo_english.lang.Tokens as Record<string, string>;
}

// --- 2) Helpers to decode attribute values
function bytesToUint32LE(bytes: Record<string, number>) {
    const b = Uint8Array.from(Object.values(bytes));
    return new DataView(b.buffer).getUint32(0, true);
}
function bytesToFloatLE(bytes: Record<string, number>) {
    const b = Uint8Array.from(Object.values(bytes));
    return new DataView(b.buffer).getFloat32(0, true);
}

const Flags = {
    // CannotTrade: (1 << 0),
    // CannotCraft: (1 << 1),
    NotEcon: (1 << 3),
    // Preview: (1 << 7)
}



function buildItemInfo(inv: CSGOItem, itemsGame: any, tokens: Record<string, string>, steamID: string) {
    const items = itemsGame.items_game.items;
    const paintKits = itemsGame.items_game.paint_kits;
    const prefabs = itemsGame.items_game.prefabs;
    const musicDefinitions = itemsGame.items_game.music_definitions;
    const charmDefinitions:
        Record<string, { name: string, loc_name: string, loc_description: string, item_rarity: string, image_inventory: string, pedestal_display_model: string }> = itemsGame.items_game.keychain_definitions;
    const stickerKits = itemsGame.items_game.sticker_kits;
    const colors = itemsGame.items_game.colors;
    const qualities = itemsGame.items_game.qualities;
    const rarities = itemsGame.items_game.rarities;

    if ((Flags.NotEcon & inv.flags) != 0) return null;


    const stickers: Item[] = [];

    inv.stickers?.forEach(sticker => {
        stickers.push(getStickerData(sticker.sticker_id, stickerKits, tokens));
    });

    const marketable = !!inv.tradable_after;


    const quality = inv.quality;
    const rarity = inv.rarity;

    const qualityColor = Object.values(qualities).find((q) => q.value === quality)?.hexColor;
    const rarityColor = colors[Object.values(rarities).find(r => r.value === rarity)?.color].hex_color;

    // 3a) base itemdef
    const itemdef = items[inv.def_index];
    if (!itemdef) return {
        rawItem: inv,
        shortName: `Unknown def_index ${inv.def_index}`,
        marketHashName: `Unknown def_index ${inv.def_index}`,
        image: null,
        ids: [inv.id],
        qualityColor,
        rarityColor,
        position: inv.position,
        wearText: "",
        marketable,
        type: ItemType.Other
    };

    let name: string = "";

    if (itemdef.item_name) {
        name = itemdef.item_name;
    } else {
        const prefab = itemdef.prefab;
        const prefabData = prefabs[prefab];
        name = prefabData.item_name;
    }

    let imageInventory: string = "";

    if (itemdef.image_inventory) {
        imageInventory = itemdef.image_inventory
    } else {
        const prefab = itemdef.prefab;
        const prefabData = prefabs[prefab];
        imageInventory = prefabData.image_inventory;
    }

    // itemdef.item_name is a localization token like "#SFUI_WPNHUD_AK47"
    const baseName = tokens[name.replace("#", "").toLowerCase()] ?? name ?? "Unknown Item";

    // 3b) look for paintkit (skins)
    // Common attribute ids:
    //   6 = paint kit index (uint32)
    //   8 = paint wear (float)
    //   37 = paint seed (uint32)
    const attrs = inv.attribute ?? [];
    const customNameAttr = attrs.find(a => a.def_index === 111 || a.def_index === 111.0);
    const pkAttr = attrs.find(a => a.def_index === 6 || a.def_index === 6.0);
    const wearAttr = attrs.find(a => a.def_index === 8 || a.def_index === 8.0);
    const musickitAttr = attrs.find(a => a.def_index === 166 || a.def_index === 166.0);
    const keychainAttr = attrs.find(a => a.def_index === 299 || a.def_index === 299.0);

    let customName = null;

    if (customNameAttr) {
        customName = inv.custom_name;
    }

    //handle storage units
    if (inv.def_index === 1201) {
        return {
            rawItem: inv,
            shortName: baseName,
            marketHashName: baseName,
            image: images[imageInventory],
            ids: [inv.id],
            stickers,
            qualityColor,
            rarityColor,
            position: inv.position,
            customName: null,
            wearText: customName,
            marketable: true,
            openLink: `#/account/${steamID}/${inv.id}`,
            type: ItemType.Container,
            itemCount: inv.casket_contained_item_count,
        }
    }

    //handle music kits
    if (musickitAttr) {
        const musicKitID = musickitAttr.value ?? (musickitAttr.value_bytes ? bytesToUint32LE(musickitAttr.value_bytes) : undefined);

        const musicDefinition = musicDefinitions[`${musicKitID}`];

        const kitName = tokens[musicDefinition.loc_name.replace("#", "").toLowerCase()];

        const isStatTrak = inv.quality === 9;
        const statTrak = isStatTrak ? "StatTrak™ " : ""
        const marketHashName = `${statTrak}${baseName} | ${kitName}`;
        return {
            rawItem: inv,
            shortName: marketHashName,
            marketHashName,
            image: images[musicDefinition.image_inventory],
            ids: [inv.id],
            qualityColor,
            rarityColor,
            position: inv.position,
            customName,
            wearText: "",
            marketable,
            type: ItemType.MusicKit,
        }
    }

    //handle charm
    if (inv.def_index === 1355) {
        if (!keychainAttr) return;
        const charmID = keychainAttr.value ?? (keychainAttr.value_bytes ? bytesToUint32LE(keychainAttr.value_bytes) : undefined);

        const charmDefinition = charmDefinitions[`${charmID}`];

        const charmName = tokens[charmDefinition.loc_name.replace("#", "").toLowerCase()];

        const marketHashName = `${baseName} | ${charmName}`;

        return {
            rawItem: inv,
            shortName: marketHashName,
            marketHashName,
            image: images[charmDefinition.image_inventory],
            ids: [inv.id],
            qualityColor,
            rarityColor,
            position: inv.position,
            customName,
            wearText: "",
            marketable,
            type: ItemType.MusicKit,
        }

    }

    //handle stickers
    if (inv.def_index === 1209) {
        const stickerID = inv.stickers[0].sticker_id;
        const stickerData = getStickerData(stickerID, stickerKits, tokens);
        return {
            ...stickerData,
            rawItem: inv,
            ids: [inv.id],
            qualityColor,
            rarityColor,
            position: inv.position,
            customName,
            wearText: "",
            marketable: true,
            type: ItemType.Sticker,
        }
    }

    //handle graffitis
    if (inv.def_index === 1348 || inv.def_index === 1349) {
        const sprayTintAttr = attrs.find(a => a.def_index === 233 || a.def_index === 233.0);
        const sprayTintID = sprayTintAttr ? sprayTintAttr.value ?? (sprayTintAttr.value_bytes ? bytesToUint32LE(sprayTintAttr.value_bytes) : null) : null;

        const graffitiID = inv.stickers[0].sticker_id;
        const graffitiKit = stickerKits[graffitiID];

        const graffitiName = tokens[graffitiKit.item_name.replace("#", "").toLowerCase()];

        const marketHashName = `${baseName} | ${graffitiName}`;
        return {
            rawItem: inv,
            shortName: marketHashName,
            marketHashName,
            image: images[`econ/stickers/${graffitiKit.sticker_material}${sprayTintID ? `_${sprayTintID}` : ""}`],
            ids: [inv.id],
            qualityColor,
            rarityColor,
            position: inv.position,
            customName,
            wearText: "",
            marketable,
            type: ItemType.Graffiti,
        }
    }

    if (!pkAttr) {
        // non-skin (case, music kit, agent, sticker, key, etc.)
        // Just return the localized base name, optionally with StatTrak for supported classes.
        const isStatTrak = inv.quality === 9; // CS:GO/CS2 uses Strange quality for StatTrak
        const marketHashName = isStatTrak ? `StatTrak™ ${baseName}` : baseName;
        const isCase = itemdef.prefab === "weapon_case" || itemdef.prefab.includes("sticker_capsule_prefab") || itemdef.prefab.includes("signature_capsule_prefab");
        return {
            rawItem: inv,
            shortName: marketHashName,
            marketHashName,
            image: images[imageInventory],
            ids: [inv.id],
            stickers,
            qualityColor,
            rarityColor,
            position: inv.position,
            customName,
            wearText: "",
            marketable: isCase ? true : marketable,
            type: isCase ? ItemType.Case : ItemType.Other,
        }
    }

    // 3c) resolve paint kit name
    // const pkId = pkAttr.value ?? (pkAttr.value_bytes ? bytesToUint32LE(pkAttr.value_bytes) : undefined);
    const paintIndex = inv.paint_index
    const pk = paintKits[paintIndex];
    const pkToken = pk?.description_tag?.replace("#", "");
    const skinName = pkToken ? tokens[pkToken.toLowerCase()] ?? pkToken : "Unknown Finish";

    // 3d) exterior from wear (market uses bucketed names)
    const wearRaw = wearAttr?.value ?? (wearAttr?.value_bytes ? bytesToFloatLE(wearAttr.value_bytes) : undefined);
    const exterior =
        wearRaw == null ? undefined :
            wearRaw <= 0.07 ? "Factory New" :
                wearRaw <= 0.15 ? "Minimal Wear" :
                    wearRaw <= 0.38 ? "Field-Tested" :
                        wearRaw <= 0.45 ? "Well-Worn" : "Battle-Scarred";

    const isStatTrak = inv.quality === 9;
    // Market-style: "StatTrak™ AK-47 | Redline (Field-Tested)"
    const shortName = `${isStatTrak ? "StatTrak™ " : ""}${inv.quality === 3 ? '★ ' : ''}${baseName} | ${skinName}`;
    const marketHashName = `${shortName}${exterior ? ` (${exterior})` : ""}`;



    const fullImageInventory = `${imageInventory}_${pk.name}_light`.replace("weapons/base_weapons", "default_generated");
    if (exterior === "Field-Tested" || exterior === "Well-Worn") {
        fullImageInventory.replace("_light_png", "_medium_png");
    }
    if (exterior === "Battle-Scarred") {
        fullImageInventory.replace("_light_png", "_heavy_png");
    }

    let price: number | null = prices[marketHashName]?.steam?.last_24h ?? null;
    if (price === null)
        price = prices[marketHashName]?.steam?.last_7d ?? null;
    if (price === null)
        price = prices[marketHashName]?.steam?.last_30d ?? null;
    if (price === null)
        price = prices[marketHashName]?.steam?.last_90d ?? null;
    if (price === null)
        price = prices[marketHashName]?.steam?.last_ever ?? null;


    return {
        shortName,
        marketHashName,
        image: images[fullImageInventory],
        ids: [inv.id],
        stickers,
        qualityColor,
        rarityColor,
        position: inv.position,
        customName,
        wear: wearRaw,
        wearText: exterior ? exterior : "",
        price,
        marketable: true,
        type: ItemType.Skin,
    }
}

function getStickerData(stickerID: string, stickerKits: any, tokens: Record<string, string>) {

    const baseName = tokens["CSGO_Tool_Sticker".toLowerCase()];

    const stickerKit = stickerKits[stickerID];

    const stickerName = tokens[stickerKit.item_name.replace("#", "").toLowerCase()];

    const marketHashName = `${baseName} | ${stickerName}`;

    return {
        shortName: stickerName,
        marketHashName,
        image: images[`econ/stickers/${stickerKit.sticker_material}`],
    }
}

export function enrichItems(inventory: CSGOItem[], steamID: string, containerID: string | undefined = undefined) {
    const itemsGame = loadItemsGame();
    let tokens = loadLocalization("english");

    tokens = Object.fromEntries(
        Object.entries(tokens).map(([k, v]) => [k.toLowerCase(), v])
    );

    const enrichedInv = inventory.filter(item => item.casket_id === containerID).map(item => {
        return buildItemInfo(item, itemsGame, tokens, steamID);
    }).filter((item) => item !== null);

    return minifyInv(enrichedInv);
}

export function minifyInv(inventory: Item[]) {
    const minifiedInv: Item[] = [];
    inventory.forEach((item: Item) => {
        if (item.type === ItemType.Case) {
            const presentItem = minifiedInv.find((i) => i.marketHashName === item.marketHashName);
            if (!presentItem) {
                minifiedInv.push(item);
                return;
            }
            if (presentItem?.amount === undefined) {
                presentItem.amount = 2;
                presentItem.ids.push(...item.ids);
            }
            else {
                if (item.amount) {
                    presentItem.amount += item.amount;
                } else presentItem.amount++;
                presentItem.ids.push(...item.ids);
            }
        } else minifiedInv.push(item);
    });
    return minifiedInv.sort((a, b) => a.position - b.position);;
}

export function itemStackAmount(items: Item[]) {
    let totalAmount = 0;
    items.forEach((item: Item) => {
        totalAmount += item.ids.length;
    });
    return totalAmount;
}

export function minifyItemsForExport(items: Item[]): MinimalItem[] {
    return items.filter((item: Item) => item.marketable).map((item: Item) => {
        return {
            marketHashName: item.marketHashName,
            amount: item.amount ?? 1,
            type: item.type,
            image: item.image
        }
    })
}