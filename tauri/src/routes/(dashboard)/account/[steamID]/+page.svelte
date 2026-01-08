<script lang="ts">
    import InventoryWrapper from "$lib/components/InventoryWrapper.svelte";
    import ItemCard from "$lib/components/ItemCard.svelte";
    import PlaceholderCard from "$lib/components/PlaceholderCard.svelte";
    import { ClientMessageType, ItemType, type Item } from "$lib/types";
    import type { PageProps } from "./$types";
    import { inventoryManager } from "$lib/inventoryManager.svelte";
    import ItemTransfer from "$lib/components/ItemTransfer.svelte";

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
    {/if}
</InventoryWrapper>

<ItemTransfer bind:this={itemTransfer} steamID={data.steamID} />
