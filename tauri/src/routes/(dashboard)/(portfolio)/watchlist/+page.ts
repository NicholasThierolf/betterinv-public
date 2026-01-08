import { fetchFromServer } from "$lib/fetchFromServer";

export const load = async () => {


    const allItems = fetchFromServer(`/api/all-items`, {
        headers: {
            "Content-Type": "application/json",
        },
    }) as Promise<string[]>;
    return { allItems };
}