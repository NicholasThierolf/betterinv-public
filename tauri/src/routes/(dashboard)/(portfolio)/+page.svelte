<script lang="ts">
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import ScanEye from "@lucide/svelte/icons/scan-eye";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import { AmountChart, LargeStat, TotalChart, Trend } from "@betterinv/lib";
    import type { PageProps } from "./$types";
    import type { PricedMinimalItem } from "@betterinv/lib/types";
    import { Button } from "$lib/components/ui/button";
    import * as Empty from "$lib/components/ui/empty";

    let { data }: PageProps = $props();

    function percentageIncrease(typeStat: {
        value: number;
        value7DaysAgo: number;
    }) {
        if (typeStat.value7DaysAgo === 0) return 0;
        return (
            ((typeStat.value - typeStat.value7DaysAgo) /
                typeStat.value7DaysAgo) *
            100
        );
    }
</script>

{#await data.dashboard}
    <section class="gap-5 w-full max-w-[1500px] mx-auto">
        <div class="flex justify-between big-stats w-full">
            <Skeleton class="w-80 h-50 rounded-xl" />
            <Skeleton class="w-80 h-50 rounded-xl" />
            <Skeleton class="w-80 h-50 rounded-xl" />
            <Skeleton class="w-80 h-50 rounded-xl" />
            <Skeleton class="w-80 h-50 rounded-xl" />
        </div>
        <Skeleton class="total-chart w-full h-150 rounded-xl" />
        <Skeleton class="amount-chart w-full h-150 rounded-xl" />
        <div class="performers w-full flex justify-between">
            <Skeleton class="total-chart w-150 h-150 rounded-xl" />
            <Skeleton class="total-chart w-150 h-150 rounded-xl" />
            <Skeleton class="total-chart w-150 h-150 rounded-xl" />
        </div>
    </section>
{:then dashboard}
    <section class="gap-5 w-full max-w-[1500px] mx-auto">
        <div class="flex justify-between big-stats w-full">
            <LargeStat
                title="Everything"
                description="Your whole inventory"
                value={dashboard.typeStats.all.value}
                change={percentageIncrease(dashboard.typeStats.all)}
                amount={dashboard.typeStats.all.amount}
            />
            <LargeStat
                title="Weapon Cases"
                description="All of your cases combined"
                value={dashboard.typeStats.cases.value}
                change={percentageIncrease(dashboard.typeStats.cases)}
                amount={dashboard.typeStats.cases.amount}
            />
            <LargeStat
                title="Weapon Skins"
                description="All of your weapon skins combined"
                value={dashboard.typeStats.skins.value}
                change={percentageIncrease(dashboard.typeStats.skins)}
                amount={dashboard.typeStats.skins.amount}
            />
            <LargeStat
                title="Sticker capsules"
                description="All of your capsules combined"
                value={dashboard.typeStats.containers.value}
                change={percentageIncrease(dashboard.typeStats.containers)}
                amount={dashboard.typeStats.containers.amount}
            />
            <LargeStat
                title="Stickers"
                description="All of your stickers combined"
                value={dashboard.typeStats.stickers.value}
                change={percentageIncrease(dashboard.typeStats.stickers)}
                amount={dashboard.typeStats.stickers.amount}
            />
        </div>
        <TotalChart class="total-chart" data={dashboard} />
        <AmountChart class="amount-chart" data={dashboard.allItems} />
        <div class="performers w-full flex justify-between">
            <Trend
                title="Best performers"
                items={dashboard.allItems
                    .toSorted((a: PricedMinimalItem, b: PricedMinimalItem) => {
                        return (
                            b.amount * (b.increaseLast7Days ?? 0) -
                            a.amount * (a.increaseLast7Days ?? 0)
                        );
                    })
                    .slice(0, 10)}
            />

            <Trend
                title="Worst performers"
                items={dashboard.allItems
                    .toSorted((a: PricedMinimalItem, b: PricedMinimalItem) => {
                        return (
                            a.amount * (a.increaseLast7Days ?? 0) -
                            b.amount * (b.increaseLast7Days ?? 0)
                        );
                    })
                    .slice(0, 10)}
            />

            <Trend
                title="Watchlist"
                class="max-h-200 overflow-y-auto"
                items={dashboard.watchedItems.toSorted(
                    (a: PricedMinimalItem, b: PricedMinimalItem) => {
                        return (
                            a.amount * (a.increaseLast7Days ?? 0) -
                            b.amount * (b.increaseLast7Days ?? 0)
                        );
                    },
                )}
            >
                {#snippet action()}
                    <Button variant="secondary" href="#/watchlist"
                        ><ExternalLink /></Button
                    >
                {/snippet}
                {#snippet empty()}
                    <Empty.Root class="w-full">
                        <Empty.Header>
                            <Empty.Media variant="icon">
                                <ScanEye />
                            </Empty.Media>
                            <Empty.Title>No Watched Items Yet</Empty.Title>
                            <Empty.Description>
                                You are currently not watching any items. Get
                                started by selecting an item you want to
                                monitor!
                            </Empty.Description>
                        </Empty.Header>
                        <Empty.Content>
                            <Button href="#/watchlist">Add Items</Button>
                        </Empty.Content>
                    </Empty.Root>
                {/snippet}
            </Trend>
        </div>
    </section>
{/await}

<style>
    section {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: auto auto auto;
        grid-template-areas:
            "big-stats big-stats big-stats big-stats"
            "performance-chart performance-chart top-20 top-20"
            "performers performers performers performers";
    }
    :global(.big-stats) {
        grid-area: big-stats;
    }
    :global(.total-chart) {
        grid-area: performance-chart;
    }
    :global(.amount-chart) {
        grid-area: top-20;
    }
    .performers {
        grid-area: performers;
    }
</style>
