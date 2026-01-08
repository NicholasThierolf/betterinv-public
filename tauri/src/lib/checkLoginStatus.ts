import { goto } from "$app/navigation";
import { communicator } from "./communicator";

export async function enforceLoginStatus() {
    const isLoggedIn = await communicator
        .requestFromNode<boolean>("is-logged-in", null)
        .then((isLoggedIn) => {
            return isLoggedIn
        });

    if (!isLoggedIn) {
        goto("#/login");
    }
}