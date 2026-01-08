<script lang="ts">
    import { ItemCard, ItemPopover, ItemSkeleton } from "@betterinv/lib";
    import type { LayoutProps } from "../$types";
    import type {
        DatedPriceHistory,
        MinimalItem,
        PricedMinimalItem,
    } from "@betterinv/lib/types";
    import { communicator } from "$lib/communicator";
    import { ClientMessageType } from "$lib/types";

    let { data }: LayoutProps = $props();

    let popupShowing: MinimalItem | null = $state(null);
    let popupOpen: boolean = $state(false);
    let itemDataPromise: Promise<DatedPriceHistory> | null = $state(null);

    function openPopup(item: MinimalItem) {
        popupShowing = item;
        popupOpen = true;
        itemDataPromise = communicator
            .requestFromNode("fetch-from-server", {
                url: `/api/prices/${item.marketHashName}`,
            })
            .then(
                (data: {
                    prices: {
                        date: string | Date;
                        price: number;
                    }[];
                    lastUpdated: Date;
                }) => {
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
</script>

{#await data.dashboard}
    <div class="col-span-full w-full flex flex-wrap gap-2 justify-center p-2">
        {#each new Array(50) as _item}
            <ItemSkeleton />
        {/each}
    </div>
{:then dashboard}
    <div class="col-span-full w-full flex flex-wrap gap-2 justify-center p-2">
        {#each dashboard.allItems.toSorted((a: PricedMinimalItem, b: PricedMinimalItem) => b.amount * (b.price ?? 0) - a.amount * (a.price ?? 0)) as item}
            <ItemCard {item} openFunction={openPopup} />
        {/each}
    </div>
{/await}

{#if itemDataPromise && popupShowing}
    <ItemPopover
        bind:open={popupOpen}
        itemName={popupShowing.marketHashName}
        itemImage={popupShowing.image}
        {itemDataPromise}
    />
{/if}
