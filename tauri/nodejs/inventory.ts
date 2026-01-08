import { InventoryData, Item } from "@betterinv/types";
import { communicator } from "./communicator.ts";
import { itemStackAmount, minifyInv, minifyItemsForExport } from "./enrichItems.ts";
import { fetchFromAPI } from "./fetchFromAPI.ts";



export class Inventory {
    private static allInventories: Record<string, Inventory> = {};

    static sync() {
        const object: Record<string, InventoryData> = {};

        Object.keys(this.allInventories).forEach((steamID: string) => {
            object[steamID] = this.allInventories[steamID].json;
        })

        communicator.eventToSvelte("inventory-data", object);
    }

    private _loaded: boolean = false;
    private mainInventory: Item[] = [];
    private containers: Record<string, Item[]> = {};
    private steamID: string;

    constructor(steamID: string) {
        this.steamID = steamID;
        Inventory.allInventories[steamID] = this;
    }

    sync() {
        Inventory.sync();
        if (!this.loaded) return;
        const allItems = [...this.mainInventory];
        Object.values(this.containers).forEach((items: Item[]) => {
            allItems.push(...items);
        })
        const minifiedInv = minifyItemsForExport(minifyInv(allItems));
        fetchFromAPI("/api/inventory", { method: "post", body: JSON.stringify({ inventory: minifiedInv, steamID: this.steamID }) })
    }

    get json(): InventoryData {
        return {
            loaded: this._loaded,
            inventory: this.mainInventory,
            containers: this.containers,
            mainInventoryItemCount: itemStackAmount(this.mainInventory)
        }
    }

    get loaded() {
        return this._loaded;
    }

    set loaded(value: boolean) {
        this._loaded = value;
        this.sync();
    }

    itemRemoved(itemID: string) {
        this.mainInventory = this.mainInventory.filter((item: Item) => {
            if (item.ids.includes(itemID)) {
                item.ids = item.ids.filter((id) => {
                    return id !== itemID
                });
                item.amount = item.ids.length;
            }
            return item.ids.length > 0;
        });
        this.sync();
    }

    itemsAdded(items: Item[]) {
        this.mainInventory = minifyInv([...this.mainInventory, ...items]);
        this.sync();
    }

    loadedInventory(items: Item[]) {
        this.mainInventory = items;
        this.sync();
    }

    loadedContainer(containerID: string, items: Item[]) {
        this.containers[containerID] = items;
        this.mainInventory.forEach((item: Item) => {
            if (item.ids[0] === containerID) {
                item.itemCount = itemStackAmount(items);
            }
        });
        this.sync();
    }
}