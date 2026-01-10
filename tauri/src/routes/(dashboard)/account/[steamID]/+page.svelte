<script lang="ts">
    import InventoryWrapper from "$lib/components/InventoryWrapper.svelte";
    import ItemCard from "$lib/components/ItemCard.svelte";
    import PlaceholderCard from "$lib/components/PlaceholderCard.svelte";
    import type { PageProps } from "./$types";
    import { inventoryManager } from "$lib/inventoryManager.svelte";
    import ItemTransfer from "$lib/components/ItemTransfer.svelte";
    import * as Item from "$lib/components/ui/item";
    import Progress from "$lib/components/ui/progress/progress.svelte";

    let { data }: PageProps = $props();
    let itemTransfer: ItemTransfer | null = $state(null);
</script>

<InventoryWrapper>
    {#if inventoryManager.data?.[data.steamID]?.loaded}
        {#each inventoryManager.data?.[data.steamID].inventory as item (item.ids[0])}
            <ItemCard
                {item}
                moveIntoContainer={() => {
                    itemTransfer?.startMoving(item);
                }}
            />
        {/each}
    {:else}
        {#each { length: 100 }, i (i)}
            <PlaceholderCard />
        {/each}
        <Item.Root
            class="fixed left-[50%] top-[50%] translate-x-[calc(125px-50%)] translate-y-[-50%] z-10 bg-background border-accent w-120 shadow-xl"
        >
            {@const loaded = inventoryManager.data?.[data.steamID]
                ?.containersLoaded ?? { loaded: 1, total: 1 }}
            <Item.Content>
                <Item.Title class="text-lg text-center w-full justify-center"
                    >Loading your storage containers</Item.Title
                >
                <Item.Description class="text-center"
                    >{loaded.loaded} / {loaded.total}</Item.Description
                >
            </Item.Content>
            <Item.Footer>
                <Progress value={(loaded.loaded / loaded.total) * 100} />
            </Item.Footer>
        </Item.Root>
    {/if}
</InventoryWrapper>

<ItemTransfer bind:this={itemTransfer} steamID={data.steamID} />
