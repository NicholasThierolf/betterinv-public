<script lang="ts">
    import * as Table from "./components/ui/table/index.ts";
    import * as Card from "./components/ui/card/index.ts";
    import type { PricedMinimalItem } from "./types.ts";
    import ChartLine from "@lucide/svelte/icons/chart-line";
    import { Badge } from "./components/ui/badge/index.ts";
    import type { Snippet } from "svelte";
    import { currencyManager } from "./currency.svelte.ts";
    import { itemPopover } from "./itemPopover/popoverStore.svelte.ts";

    const {
        items,
        title,
        class: className = "",
        action,
        empty,
    }: {
        items: PricedMinimalItem[];
        title: string;
        class?: string;
        action?: Snippet;
        empty?: Snippet;
    } = $props();

    function calculatePercentageIncrease(item: PricedMinimalItem) {
        return (
            ((item.increaseLast7Days ?? 0) /
                ((item.price ?? 0) - (item.increaseLast7Days ?? 0))) *
            100
        );
    }
</script>

<Card.Root class={`pl-5 pr-1 gap-0 w-150 ${className}`}>
    <Card.Header>
        <Card.Title>{title}</Card.Title>
        <Card.Action class="flex items-center"
            >{#if action}{@render action()}{/if}</Card.Action
        >
        <Card.Description></Card.Description>
    </Card.Header>
    <Card.Content>
        {#if items.length === 0 && empty}
            {@render empty()}
        {:else}
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Item</Table.Head>
                        <Table.Head>Percent</Table.Head>
                        <Table.Head class="text-end">P/L</Table.Head>
                        <Table.Head></Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body class="text-xs">
                    {#each items as item}
                        <Table.Row>
                            <Table.Cell
                                class="whitespace-normal flex gap-1 items-center"
                            >
                                <img src={item.image} alt="" class="h-6" />
                                {item.marketHashName}</Table.Cell
                            >
                            <Table.Cell>
                                <span
                                    class:text-red-600={(item.increaseLast7Days ??
                                        0) < 0}
                                    class:text-green-600={(item.increaseLast7Days ??
                                        0) > 0}
                                >
                                    {Math.round(
                                        calculatePercentageIncrease(item),
                                    )}%</span
                                ></Table.Cell
                            >
                            <Table.Cell class="text-end">
                                <span
                                    class:text-red-600={(item.increaseLast7Days ??
                                        0) < 0}
                                    class:text-green-600={(item.increaseLast7Days ??
                                        0) > 0}
                                >
                                    {currencyManager.currencyFormater(
                                        (item.increaseLast7Days ?? 0) *
                                            item.amount,
                                    )}
                                </span>
                            </Table.Cell>
                            <Table.Cell class="text-end">
                                <button
                                    onclick={() => {
                                        itemPopover.open(item);
                                    }}
                                    class="cursor-pointer"
                                    ><Badge variant="secondary"
                                        ><ChartLine size="30" /></Badge
                                    ></button
                                >
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        {/if}
    </Card.Content>
</Card.Root>
