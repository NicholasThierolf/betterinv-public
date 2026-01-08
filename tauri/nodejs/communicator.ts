import type { EventName, NodeToSvelte, RequestName } from "@betterinv/types";
import { Account } from "./accountManager";
import { Inventory } from "./inventory";
import { fetchFromAPI } from "./fetchFromAPI";
import { getPriceHistory } from "./priceManager";
import { handleDeepLink } from "./handleDeepLink";
import { deletePassword } from "./password";
import { sendStoredLogs } from "./logger";
import { getProfilePicture } from "./getSteamProfilePicture";

class Communicator {

    private sendToSvelteFunction: (message: NodeToSvelte) => void;

    init(sendToSvelteFunction: (message: NodeToSvelte) => void) {
        this.sendToSvelteFunction = sendToSvelteFunction;
        Account.loadAccounts().then(() => { });
    }

    async handleRequestFromFrontend(cmd: RequestName, payload: any) {
        switch (cmd) {
            case "add-account":
                Account.addAccount();
                return;
            case "stop-adding-account":
                Account.stopAddingAccount(payload);
                return;
            case "login-account":
                Account.loginAccount(payload);
                return;
            case "sync-inventory":
                Inventory.sync();
                return;
            case "logout":
                deletePassword("user");
                return;
            case "sync-data":
                //receives the name of the requested sync object as payload.
                //requestSync(message.data);
                //TODO: implement
                return;
            case "is-logged-in":
                const { isLoggedIn } = await fetchFromAPI("/api/check-login").then(data => data.json());
                return isLoggedIn;
            case "get-accounts":
                return Account.accounts;
            case "get-price-history":
                return await getPriceHistory();
            case "send-to-container": {
                const steamID = payload.steamID;
                const containerID = payload.containerID;
                const itemIDs = payload.itemIDs;
                const account = Account.getAccount(steamID);
                if (!account) return false;
                for (const itemID of itemIDs) {
                    await account.addToContainer(itemID, containerID);
                }
                return true;
            }
            case "remove-from-container": {
                const steamID = payload.steamID;
                const containerID = payload.containerID;
                const itemIDs = payload.itemIDs;
                const account = Account.getAccount(steamID);
                if (!account) return false;
                for (const itemID of itemIDs) {
                    await account.removeFromContainer(itemID, containerID);
                }
                return true;
            }
            case "fetch-from-server":
                const requestUrl = payload.url;
                const requestOptions = payload.options ?? {};
                if (!requestUrl) return false;
                const answer = await fetchFromAPI(requestUrl, requestOptions).then(data => data.json()).catch((e: any) => {
                    return { error: true }
                })
                return answer;
            case "log-in":
                const { username, password, steamguard, steamID } = payload;
                return Account.loginWithCredentials(username, password, steamguard, steamID);
            case "get-profile-picture":
                return await getProfilePicture(payload);
            case "handle-deep-link":
                return await handleDeepLink(payload);
            case "send-stored-logs":
                sendStoredLogs();
                return;
        }
    }

    eventToSvelte(eventName: EventName, payload: any) {
        const message: NodeToSvelte = {
            eventName,
            type: "event",
            data: payload,
        }
        this.sendToSvelteFunction(message);
    }
}

export const communicator = new Communicator();