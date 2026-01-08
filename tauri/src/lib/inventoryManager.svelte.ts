import { communicator } from "./communicator";
import { ClientMessageType, MessageType, type InventoryData, type message } from "./types";

class InventoryManager {
    data: Record<string, InventoryData> = $state({});
    constructor() {
        communicator.onEvent("inventory-data", (data: Record<string, InventoryData>) => {
            this.data = data;
        });
    }

    init() {
        communicator.requestFromNode<void>("sync-inventory", null);
        console.log("[Inventory Manager] Initialized");
    }
}


export const inventoryManager = new InventoryManager();