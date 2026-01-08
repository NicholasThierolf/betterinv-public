<script lang="ts">
    import * as ItemElement from "./components/ui/item/index.js";
    import ChartLine from "@lucide/svelte/icons/chart-line";
    import { Badge } from "./components/ui/badge/index.js";
    import { type MinimalItem, type PricedMinimalItem } from "./types.ts";

    import Sparkline from "$lib/Sparkline.svelte";
    import { currencyManager } from "./currency.svelte.ts";
    import { itemPopover } from "./itemPopover/popoverStore.svelte.ts";
    import Trash from "@lucide/svelte/icons/trash";
    import { Button } from "./components/ui/button/index.ts";

    const {
        item,
        steamFunction = false,
        ondelete,
        variant = "normal",
    }: {
        item: PricedMinimalItem;
        steamFunction?: CallableFunction | false;
        ondelete?: CallableFunction;
        variant?: "normal" | "watchlist";
    } = $props<{
        item: PricedMinimalItem;
        steamFunction?: CallableFunction | false;
        ondelete?: CallableFunction;
        variant?: "normal" | "watchlist";
    }>();
</script>

<ItemElement.Root variant="outline" class="w-50">
    <ItemElement.Header class="relative">
        <img src={item.image} alt="" class="relative z-10" />
        <div class="absolute left-0 top-0 w-full h-full z-0 opacity-50"></div>
        <div class="absolute right-0 bottom-0 flex z-30 gap-2 items-center">
            <button
                onclick={() => {
                    itemPopover.open(item);
                }}
                class="cursor-pointer"
                ><Badge variant="secondary"><ChartLine size="30" /></Badge
                ></button
            >
        </div>
        {#if item.amount}
            <Badge variant="secondary" class="absolute left-0 top-0 z-30"
                >{item.amount}x</Badge
            >
        {/if}
        {#if variant === "normal"}
            <Badge variant="secondary" class="absolute right-0 top-0 z-30"
                >{currencyManager.currencyFormater(item.price ?? 1)}</Badge
            >
        {/if}
        {#if variant === "watchlist"}
            <button
                class="cursor-pointer"
                onclick={() => {
                    ondelete?.();
                }}
                ><Badge
                    variant="secondary"
                    class="absolute right-0 top-0 z-30 text-xs cursor-pointer"
                >
                    <Trash size="10" /></Badge
                ></button
            >
        {/if}
    </ItemElement.Header>
    <ItemElement.Content>
        <ItemElement.Title class="flex-col items-start gap-0">
            <div>{item.marketHashName}</div>
            <div class="font-bold text-xs">
                {#if variant === "normal"}
                    {currencyManager.currencyFormater(
                        item.amount * (item.price ?? 0),
                    )}
                {/if}
                {#if variant === "watchlist"}
                    {currencyManager.currencyFormater(item.price ?? 0)}
                {/if}
            </div>
        </ItemElement.Title>
        <ItemElement.Description class="line-clamp-8">
            {#if item.last7Days}
                <Sparkline data={item.last7Days} strokeWidth={1} />
            {/if}
        </ItemElement.Description>
    </ItemElement.Content>
</ItemElement.Root>
