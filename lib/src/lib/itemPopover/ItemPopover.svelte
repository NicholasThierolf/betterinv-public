<script lang="ts">
    import * as Dialog from "../components/ui/dialog/index.ts";
    import * as ToggleGroup from "../components/ui/toggle-group/index.ts";
    import SingleItemChart from "../SingleItemChart.svelte";
    import SteamIcon from "../icons/steam.png";
    import FloatIcon from "../icons/csfloat.png";
    import { Button } from "../components/ui/button/index.ts";
    import { itemPopover } from "./popoverStore.svelte.ts";

    let days = $state("180");
</script>

<Dialog.Root bind:open={itemPopover.isOpen}>
    <Dialog.Content class="min-w-[90%] min-h-[90%] p-15 max-h-[90%]">
        <Dialog.Header>
            <Dialog.Title class="flex justify-between">
                <span>{itemPopover.popupShowing?.marketHashName}</span>
                <div class="flex items-baseline text-sm font-normal">
                    Show&nbsp;
                    <ToggleGroup.Root
                        size="sm"
                        variant="outline"
                        type="single"
                        bind:value={days}
                    >
                        <ToggleGroup.Item value="7">7</ToggleGroup.Item>
                        <ToggleGroup.Item value="30">30</ToggleGroup.Item>
                        <ToggleGroup.Item value="90">90</ToggleGroup.Item>
                        <ToggleGroup.Item value="180">180</ToggleGroup.Item>
                        <ToggleGroup.Item value="all">all</ToggleGroup.Item>
                    </ToggleGroup.Root>
                    &nbsp;Days
                </div>
            </Dialog.Title>
            <img
                class="h-25 w-auto ml-auto mt-4"
                src={itemPopover.popupShowing?.image}
                alt={itemPopover.popupShowing?.marketHashName}
            />
        </Dialog.Header>
        <Dialog.Description class="overflow-y-auto">
            {#key itemPopover.popupShowing?.marketHashName}
                {#if itemPopover.itemDataPromise}
                    <div class="w-full h-[500px] max-h-[70%] py-2">
                        <SingleItemChart
                            {days}
                            itemDataPromise={itemPopover.itemDataPromise}
                        />
                    </div>
                {/if}
            {/key}
            <div class="flex justify-between mt-5">
                <div class="flex flex-col gap-2">
                    <Button
                        variant="outline"
                        href={`https://steamcommunity.com/market/listings/730/${itemPopover.popupShowing?.marketHashName}`}
                        target="_blank"
                        class="flex justify-start"
                    >
                        <img
                            src={SteamIcon}
                            alt="steam"
                            class="w-5 cursor-pointer"
                        />
                        View on Steam community market
                    </Button>
                    <Button
                        variant="outline"
                        href={`https://skinport.com/market?search=${encodeURIComponent(itemPopover.popupShowing?.marketHashName ?? "")}`}
                        target="_blank"
                        class="flex justify-start"
                    >
                        <img
                            src={FloatIcon}
                            alt="Skinport"
                            class="w-5 cursor-pointer"
                        />
                        View on Skinport
                    </Button>
                    <Button
                        variant="outline"
                        href={`https://skinport.com/market?search=${encodeURIComponent(itemPopover.popupShowing?.marketHashName ?? "")}`}
                        target="_blank"
                        class="flex justify-start"
                    >
                        <img
                            src={FloatIcon}
                            alt="CSFloat"
                            class="w-5 cursor-pointer"
                        />
                        View on CSFloat
                    </Button>
                </div>
                <div>
                    {#await itemPopover.itemDataPromise then itemData}
                        Last updated: {new Date(
                            itemData?.lastUpdated ?? 0,
                        ).toLocaleString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    {/await}
                </div>
            </div>
        </Dialog.Description>
    </Dialog.Content>
</Dialog.Root>
