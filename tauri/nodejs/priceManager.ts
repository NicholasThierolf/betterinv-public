import { fetchFromAPI } from "./fetchFromAPI.ts";

let priceHistoryPromise: null | Promise<any> = null;

export async function getPriceHistory() {
    if (priceHistoryPromise === null)
        priceHistoryPromise = fetchFromAPI("/api/prices").then(data => {
            const json = data.json();
            return json;
        });
    return await priceHistoryPromise;
}