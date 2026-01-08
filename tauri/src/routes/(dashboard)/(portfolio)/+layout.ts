import { goto } from "$app/navigation";
import { enforceLoginStatus } from "$lib/checkLoginStatus";
import { communicator } from "$lib/communicator";
import { ClientMessageType } from "$lib/types";

export async function load() {

    await enforceLoginStatus();


    const dashboardData = communicator.requestFromNode("fetch-from-server", {
        url: "/api/dashboard",
        options: {
            headers: {
                "Content-Type": "application/json",
            },
        }
    });
    return {
        dashboard: dashboardData
    }
}