<script lang="ts">
    import * as Empty from "$lib/components/ui/empty/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
    import ScanEye from "@lucide/svelte/icons/scan-eye";
    import Fuse from "fuse.js";
    import { Spinner } from "$lib/components/ui/spinner/index.js";
    import * as Item from "$lib/components/ui/item/index.js";
    import type { MinimalItem, PricedMinimalItem } from "./types.ts";
    import { biFetch, ItemCard, itemPopover, ItemSkeleton } from "./index.ts";
    import { invalidateAll } from "$app/navigation";
    import * as ItemElement from "./components/ui/item/index.js";
    import { toast } from "svelte-sonner";
    import { confirmDelete } from "./components/ui/confirm-delete-dialog/confirm-delete-dialog.svelte";
    import { env } from "$env/dynamic/public";

    let {
        allItems,
        watchedItems,
    }: {
        allItems: Promise<string[]>;
        watchedItems: Promise<PricedMinimalItem[]>;
    } = $props();

    let fuse: Fuse<string> | undefined;

    allItems.then((is) => {
        fuse = new Fuse(is, {
            includeScore: true,
            ignoreDiacritics: true,
            threshold: 0.6,
            ignoreLocation: true,
        });
        items = is;
    });

    let items: string[] = [];

    let val = $state("");
    let debouncedVal = $state("");

    let debounceTimer: ReturnType<typeof setTimeout>;

    $effect(() => {
        const v = val;
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
            debouncedVal = val;
        }, 200);
    });

    let shownItems = $derived.by(() => {
        if (debouncedVal.length > 0) {
            return fuse
                ?.search(debouncedVal)
                .slice(0, 50)
                .map((r) => r.item);
        }

        return items.slice(0, 10);
    });

    let commandOpen = $state(false);

    $effect(() => {
        if (!commandOpen) val = "";
    });

    function addItem(item: string) {
        commandOpen = false;
        biFetch<{ success: boolean }>(
            `${env.PUBLIC_SERVER_URL}/api/watch-item`,
            {
                method: "POST",
                body: JSON.stringify({
                    marketHashName: item,
                }),
            },
        )
            .then((data) => {
                if (!data.success) {
                    toast.error(
                        "Failed to add item to watchlist: Server Error",
                    );
                } else {
                    invalidateAll();
                }
            })
            .catch((err) => {
                toast.error("Failed to add item to watchlist: Server Error");
            });
    }

    function deleteItem(item: string) {
        confirmDelete({
            title: "Stop watching Item",
            description: `Do you really want to delete ${item} from your watchlist?`,
            onConfirm: async () => {
                return biFetch<{ success: boolean }>(
                    `${env.PUBLIC_SERVER_URL}/api/watch-item`,
                    {
                        method: "DELETE",
                        body: JSON.stringify({
                            marketHashName: item,
                        }),
                    },
                )
                    .then((data) => {
                        if (!data.success) {
                            toast.error(
                                "Failed to remove item from watchlist: Server Error",
                            );
                        } else {
                            invalidateAll();
                        }
                    })
                    .catch((err) => {
                        toast.error(
                            "Failed to remove item from watchlist: Server Error",
                        );
                    });
            },
        });
    }
</script>

<Command.Dialog bind:open={commandOpen}>
    <Command.Root shouldFilter={false}>
        {#await allItems}
            <Item.Root variant="muted">
                <Item.Media>
                    <Spinner />
                </Item.Media>
                <Item.Content>
                    <Item.Title class="line-clamp-1"
                        >Loading items...</Item.Title
                    >
                </Item.Content>
            </Item.Root>
        {:then}
            <Command.Input
                bind:value={val}
                placeholder="Type a command or search..."
            />
            <Command.List>
                {#each shownItems as item}
                    <Command.Item
                        onclick={() => {
                            addItem(item);
                        }}>{item}</Command.Item
                    >
                {/each}
            </Command.List>
        {/await}
    </Command.Root>
</Command.Dialog>

<section class="w-full flex flex-wrap gap-2 justify-center p-2">
    {#await watchedItems}
        {#each new Array(50) as _item}
            <ItemSkeleton />
        {/each}
    {:then items}
        {#if items.length === 0}
            <Empty.Root>
                <Empty.Header>
                    <Empty.Media variant="icon">
                        <ScanEye />
                    </Empty.Media>
                    <Empty.Title>No Watched Items Yet</Empty.Title>
                    <Empty.Description>
                        You are currently not watching any items. Get started by
                        selecting an item you want to monitor!
                    </Empty.Description>
                </Empty.Header>
                <Empty.Content>
                    <Button
                        onclick={() => {
                            commandOpen = true;
                        }}>Add Item</Button
                    >
                </Empty.Content>
            </Empty.Root>
        {:else}
            <ItemElement.Root variant="outline" class="w-50">
                <ItemElement.Content class="flex justify-center items-center">
                    <ItemElement.Description class="text-center mb-4">
                        <ScanEye class="mx-auto mb-4" />
                        Want to watch more items?
                    </ItemElement.Description>
                    <Button
                        onclick={() => {
                            commandOpen = true;
                        }}>Add Item</Button
                    >
                </ItemElement.Content>
            </ItemElement.Root>
        {/if}
        {#each items.toReversed() as item}
            <ItemCard
                {item}
                variant="watchlist"
                ondelete={() => {
                    deleteItem(item.marketHashName);
                }}
            />
        {/each}
    {/await}
</section>
