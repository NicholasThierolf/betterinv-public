import { goto } from "$app/navigation";
import { enforceLoginStatus } from "$lib/checkLoginStatus";
import { communicator } from "$lib/communicator";
import { ClientMessageType } from "$lib/types";
import "../../app.css";

export async function load() {

    const loggedIn = await enforceLoginStatus();

    const history = await communicator.requestFromNode<Record<string, number[]>>("get-price-history", null);
    return {
        history
    }
}

