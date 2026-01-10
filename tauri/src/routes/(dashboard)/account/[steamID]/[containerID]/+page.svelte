<script lang="ts">
    import ArrowLeft from "@lucide/svelte/icons/move-left";
    import InventoryWrapper from "$lib/components/InventoryWrapper.svelte";
    import ItemCard from "$lib/components/ItemCard.svelte";
    import PlaceholderCard from "$lib/components/PlaceholderCard.svelte";
    import { inventoryManager } from "$lib/inventoryManager.svelte";
    import type { PageProps } from "./$types";
    import ItemTransfer from "$lib/components/ItemTransfer.svelte";

    let { data }: PageProps = $props();

    let itemTransfer: ItemTransfer | null = $state(null);
</script>

<a href={`#/account/${data.steamID}`} class="flex items-center gap-2"
    ><ArrowLeft />Back</a
>
<InventoryWrapper>
    {#if inventoryManager.data?.[data.steamID]?.loaded}
        {#each inventoryManager.data?.[data.steamID].containers[data.containerID] as item (item.ids[0])}
            <ItemCard
                {item}
                moveIntoContainer={() => {
                    itemTransfer?.startMoving(item);
                }}
                moveOutOfContainer
            />
        {/each}
    {:else}
        {#each { length: 100 }, i (i)}
            <PlaceholderCard />
        {/each}
    {/if}
</InventoryWrapper>

<ItemTransfer
    bind:this={itemTransfer}
    steamID={data.steamID}
    moveOut={data.containerID}
/>
