import { fetchFromServer } from "$lib/fetchFromServer";
import { inventoryManager } from "$lib/inventoryManager.svelte";
import type { ServerInit } from "@sveltejs/kit";
import { currencyManager } from "@betterinv/lib";
import { communicator } from "$lib/communicator";

export const init: ServerInit = async () => {
    console.log("init fired!");
    communicator.init();
    inventoryManager.init();

    communicator.requestFromNode("send-stored-logs", null).then(() => {
        console.log("requested stored logs")
    })
}
