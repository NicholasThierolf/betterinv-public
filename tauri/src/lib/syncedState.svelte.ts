import { communicator } from "./communicator";
import { ClientMessageType, MessageType, type message, type SyncMessage } from "./types";

export function createSyncedState<T>(name: string) {

    const state = $state<{ value: T | null }>({ value: null });

    communicator.onEvent("sync-data", (message: SyncMessage<T>) => {
        console.log("received message!", message.data.stateName)
        if (message.data.stateName !== name) return;
        console.log("working with message!", message.data.stateData);
        state.value = message.data.stateData;
    });

    communicator.requestFromNode("sync-data", name);

    return state;
}