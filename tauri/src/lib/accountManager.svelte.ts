import { communicator } from "./communicator";

export let accountState: { accounts: { name: string, steamID: string, loginExpired: false }[] } = $state({ accounts: [] });

let isInitiated = false;
export async function initAccountManager() {
    if (isInitiated) return;
    communicator.onEvent("account-data", (data: { accounts: { name: string, steamID: string, loginExpired: false }[] }) => {
        console.log("got account data!", data);
        accountState.accounts = data.accounts;
    })
    isInitiated = true;

    const accs = await communicator.requestFromNode<{ name: string, steamID: string, loginExpired: false }[]>("get-accounts", null);

    console.log(accs);

    accountState.accounts = accs;
}
