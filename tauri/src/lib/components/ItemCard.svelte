<script lang="ts">
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import * as ItemElement from "$lib/components/ui/item/index.js";
    import WearIndicator from "./WearIndicator.svelte";
    import TagIcon from "@lucide/svelte/icons/tag";
    import PackagePlus from "@lucide/svelte/icons/package-plus";
    import PackageMinus from "@lucide/svelte/icons/package-minus";
    import PackageOpen from "@lucide/svelte/icons/package-open";
    import ChartLine from "@lucide/svelte/icons/chart-line";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { type Item } from "$lib/types";

    import Sparkline from "./Sparkline.svelte";
    import { page } from "$app/state";
    import { Button } from "./ui/button";
    import { ItemType } from "@betterinv/types";
    import { itemPopover } from "@betterinv/lib";

    const {
        item,
        moveIntoContainer = false,
        moveOutOfContainer = false,
    }: {
        item: Item;
        moveIntoContainer: false | CallableFunction;
        moveOutOfContainer?: boolean;
    } = $props();

    if (item.marketHashName === "Gamma Case")
        console.log(
            "Ich bins!",
            page.data.history[item.marketHashName][
                page.data.history[item.marketHashName].length - 1
            ].toFixed(2),
            item.marketable,
        );
</script>

<ItemElement.Root
    variant="outline"
    class="w-60"
    style={item.qualityColor === "#D2D2D2"
        ? ""
        : `border-color: ${item.qualityColor}88`}
>
    <ItemElement.Header class="flex flex-col items-end">
        <div class="relative w-full flex flex-col items-center">
            <img src={item.image} alt="" class="relative z-10 w-[80%]" />
            <div
                class="absolute left-[10%] top-0 w-[80%] h-full z-0 opacity-50"
                style:background={`radial-gradient(circle, ${item.rarityColor} 0%, transparent 60%)`}
            ></div>
            {#if item.amount}
                <Badge variant="secondary" class="absolute left-0 top-0 z-30"
                    >{item.amount}x</Badge
                >
            {/if}
            {#if item.marketable && page.data.history[item.marketHashName]}
                <Badge variant="secondary" class="absolute right-0 top-0 z-30"
                    >{page.data.history[item.marketHashName][
                        page.data.history[item.marketHashName].length - 1
                    ].toFixed(2)}€</Badge
                >
            {/if}
            {#if item.itemCount}
                <Badge variant="secondary" class="absolute right-0 top-0 z-30"
                    >{item.itemCount}</Badge
                >
            {/if}

            {#if item.stickers}
                <div class="flex absolute bottom-0 right-0 h-6 z-20">
                    {#each item.stickers as sticker}
                        <img src={sticker.image} alt="sticker" />
                    {/each}
                </div>
            {/if}
            {#if item.customName}
                <Tooltip.Root>
                    <Tooltip.Trigger class="absolute top-7 right-0.5 z-30">
                        <TagIcon size="16" />
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p class="italic">{item.customName}</p>
                    </Tooltip.Content>
                </Tooltip.Root>
            {/if}
        </div>

        <div class="flex justify-end gap-2">
            {#if item.type === ItemType.Container}
                <Button
                    variant="secondary"
                    class="cursor-pointer"
                    href={item.openLink}><PackageOpen /></Button
                >
            {/if}
            {#if item.marketable && item.type !== ItemType.Container}
                <Button
                    variant="secondary"
                    class="cursor-pointer p-0"
                    onclick={() => {
                        itemPopover.open(item);
                    }}
                >
                    <ChartLine size="30" /></Button
                >
            {/if}
            {#if item.marketable && moveIntoContainer && item.type !== ItemType.Container}
                <Button
                    variant="secondary"
                    class="cursor-pointer p-0"
                    onclick={() => {
                        moveIntoContainer();
                    }}
                >
                    {#if moveOutOfContainer}
                        <PackageMinus />
                    {:else}
                        <PackagePlus />
                    {/if}</Button
                >
            {/if}
        </div>
    </ItemElement.Header>
    <ItemElement.Content>
        <ItemElement.Title class="flex-col items-start gap-0">
            <div>{item.shortName}</div>
            <div class="text-xs text-secondary-foreground">
                {item.wearText}
            </div>
        </ItemElement.Title>
        <ItemElement.Description class="line-clamp-8">
            {#if item.wear}
                <WearIndicator wear={item.wear} />
            {/if}
            {#if item.marketable && page.data.history[item.marketHashName]}
                <Sparkline
                    data={page.data.history[item.marketHashName]}
                    strokeWidth={1}
                />
            {/if}
        </ItemElement.Description>
    </ItemElement.Content>
</ItemElement.Root>
