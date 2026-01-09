<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import ContainerSelectItem from "$lib/components/ContainerSelectItem.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Spinner } from "$lib/components/ui/spinner/index.js";
    import { inventoryManager } from "$lib/inventoryManager.svelte";
    import { ClientMessageType, ItemType, type Item } from "$lib/types";
    import { communicator } from "$lib/communicator";

    const {
        steamID,
        moveOut = null,
    }: { steamID: string; moveOut?: string | null } = $props();

    const DialogStates = {
        SelectingContainer: 1,
        SettingAmount: 2,
        Transfering: 3,
    };

    let dialogState = $state(DialogStates.SelectingContainer);

    let dialogOpen = $state(false);
    let itemInDialog: null | Item = $state(null);
    let selectedContainer: null | Item = $state(null);
    let amountToMove = $state(0);

    let maxAmount = $derived.by(() => {
        if (moveOut)
            return Math.min(
                1000 -
                    (inventoryManager.data?.[steamID].mainInventoryItemCount ??
                        0),
                itemInDialog?.amount ?? 1,
            );
        else
            return Math.min(
                1000 - (selectedContainer?.itemCount ?? 0),
                itemInDialog?.amount ?? 1,
            );
    });

    let containers = $derived.by(() => {
        return inventoryManager.data?.[steamID].inventory.filter(
            (item) => item.type === ItemType.Container,
        );
    });

    export function startMoving(item: Item) {
        dialogOpen = true;
        itemInDialog = item;
        if (moveOut) {
            if (
                itemInDialog.amount === undefined ||
                itemInDialog.amount === 1
            ) {
                amountToMove = 1;
                moveOutOfContainer();
            } else {
                dialogState = DialogStates.SettingAmount;
            }
        } else {
            dialogState = DialogStates.SelectingContainer;
        }
    }

    function selectContainer(container: Item) {
        if (itemInDialog === null) return;
        selectedContainer = container;
        if (itemInDialog.amount === undefined || itemInDialog.amount === 1) {
            amountToMove = 1;
            moveIntoContainer();
        } else {
            dialogState = DialogStates.SettingAmount;
        }
    }

    async function moveIntoContainer() {
        if (selectedContainer === null) return;
        dialogState = DialogStates.Transfering;

        const IDs = itemInDialog?.ids.slice(
            0,
            Math.min(amountToMove, itemInDialog.ids.length),
        );

        await communicator.requestFromNode("send-to-container", {
            steamID: steamID,
            containerID: selectedContainer.ids[0],
            itemIDs: IDs,
        });
        dialogOpen = false;
        amountToMove = 1;
        selectedContainer = null;
        itemInDialog = null;
    }

    async function moveOutOfContainer() {
        dialogState = DialogStates.Transfering;

        const IDs = itemInDialog?.ids.slice(
            0,
            Math.min(amountToMove, itemInDialog.ids.length),
        );

        await communicator.requestFromNode("remove-from-container", {
            steamID: steamID,
            containerID: moveOut,
            itemIDs: IDs,
        });
        console.log("removed successfully");
        dialogOpen = false;
        amountToMove = 1;
        selectedContainer = null;
        itemInDialog = null;
    }
</script>

<Dialog.Root open={dialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Moving Item</Dialog.Title>
            <Dialog.Description>
                {#if dialogState === DialogStates.Transfering}
                    <div class="flex flex-col">
                        <span>Moving...</span>
                        <Spinner />
                    </div>
                {/if}
                {#if dialogState === DialogStates.SelectingContainer}
                    Choose a container to move your {itemInDialog?.marketHashName}
                    into
                {/if}
            </Dialog.Description>
        </Dialog.Header>
        {#if dialogState === DialogStates.SelectingContainer}
            <div class="w-full h-[50vh] flex flex-wrap overflow-auto gap-2">
                {#if inventoryManager.data?.[steamID]?.loaded}
                    {#each containers as container (container.ids[0])}
                        <ContainerSelectItem
                            item={container}
                            onclick={() => {
                                selectContainer(container);
                            }}
                        />
                    {/each}
                {/if}
            </div>
        {/if}
        {#if dialogState === DialogStates.SettingAmount}
            <Input
                bind:value={amountToMove}
                type="number"
                min="1"
                max={maxAmount}
            />
            {#if moveOut}
                <Button onclick={moveOutOfContainer}
                    >Remove from container</Button
                >
            {:else}
                <Button onclick={moveIntoContainer}>Send to container</Button>
            {/if}
        {/if}
    </Dialog.Content>
</Dialog.Root>
