import { biFetch } from "../biFetch.ts";
import type { DatedPriceHistory, MinimalItem } from "$lib/types.ts";


class ItemPopover {
    popupShowing = $state<MinimalItem | null>(null);
    isOpen = $state(false);
    itemDataPromise = $state<Promise<DatedPriceHistory> | null>(null);
    open(item: MinimalItem) {
        console.log(this);
        this.popupShowing = item;
        this.isOpen = true;
        this.itemDataPromise = biFetch<{
            prices: {
                date: string | Date;
                price: number;
            }[];
            lastUpdated: Date;
        }>(`/api/prices/${item.marketHashName}`)
            .then(
                (data) => {
                    data.prices = data.prices.map(
                        (price: { price: number; date: string | Date }) => {
                            price.date = new Date(price.date);
                            return price;
                        },
                    );
                    return data as DatedPriceHistory;
                },
            );
    }
}

export const itemPopover = new ItemPopover();