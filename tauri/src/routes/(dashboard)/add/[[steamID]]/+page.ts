import { communicator } from "$lib/communicator"
import { ClientMessageType, MessageType, type message } from "$lib/types"

export const load = async ({ url, params }) => {

    const steamID = params.steamID ?? null;

    let QRCode: Promise<string>;

    if (steamID) {
        QRCode = loginAccount(steamID);
    } else {
        QRCode = createNewLogin();
    }

    return {
        QRCode: QRCode ?? null,
        steamID
    }

}


async function createNewLogin() {
    const url = await new Promise<string>((resolve) => {
        communicator.onEvent("request-qr-code-usage", (url: string) => {
            resolve(url);
        });
        communicator.requestFromNode("add-account", null);
    })

    return url;
}

async function loginAccount(steamID: string) {
    console.log("logging in account!", steamID);
    const url = await new Promise<string>((resolve) => {
        communicator.onEvent("request-qr-code-usage", (url: string) => {
            resolve(url);
        });
        communicator.requestFromNode("login-account", steamID);
    });

    console.log("got message!", url);

    return url;
}