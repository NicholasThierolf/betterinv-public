import { goto } from "$app/navigation";
import { enforceLoginStatus } from "$lib/checkLoginStatus";
import { communicator } from "$lib/communicator";
import { fetchFromServer } from "$lib/fetchFromServer";
import { ClientMessageType } from "$lib/types";
import type { DayRates } from "@betterinv/types";
import "../../app.css";
import type { UserPreferences } from "@betterinv/lib/types";

export async function load() {

    const loggedIn = await enforceLoginStatus();

    const history = await communicator.requestFromNode<Record<string, number[]>>("get-price-history", null);

    let preferences: UserPreferences = await fetchFromServer("/api/preferences");
    let rates: DayRates = await fetchFromServer("/api/rates");
    return {
        history,
        preferences,
        rates
    }
}

