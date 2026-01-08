<script lang="ts">
    import type { DatedPriceHistory } from "./types.ts";
    import * as Chart from "./components/ui/chart/index.js";
    import { Skeleton } from "./components/ui/skeleton/index.js";
    import { AreaChart, LinearGradient, Area, Tooltip } from "layerchart";
    import { curveNatural } from "d3-shape";
    import { currencyManager } from "./currency.svelte.ts";

    let {
        itemDataPromise,
        days,
    }: { itemDataPromise: Promise<DatedPriceHistory>; days: string } = $props();

    const chartConfig = {} satisfies Chart.ChartConfig;

    let data:
        | {
              date: Date;
              price: number;
          }[]
        | undefined = $state();

    $effect(() => {
        let amount = -1;
        switch (days) {
            case "7":
                amount = 7;
                break;
            case "30":
                amount = 30;
                break;
            case "90":
                amount = 90;
                break;
            case "180":
                amount = 180;
                break;
            case "all":
                amount = -1;
                break;
        }
        itemDataPromise.then((d) => {
            const cutoffDate = new Date();
            cutoffDate.setHours(14);
            cutoffDate.setDate(cutoffDate.getDate() - amount);
            data = d.prices.filter((price) => {
                if (amount === -1) return true;
                return price.date > cutoffDate;
            });

            // Normalize to Date objects
            const minDate = new Date(
                Math.min(...data.map((d) => d.date.getTime())),
            );
            const maxDate = new Date(
                Math.max(...data.map((d) => d.date.getTime())),
            );

            const msDiff = maxDate.getTime() - minDate.getTime();
            daysDiff = msDiff / (1000 * 60 * 60 * 24);
            yearsDiff = daysDiff / 365;

            // booleans to switch config
            isLongRange = yearsDiff >= 1; // e.g. show yearly labels when >= 1 year
            isShortRange = daysDiff <= 31; // e.g. show daily labels when <= 1 month

            const minYear = minDate.getUTCFullYear();
            const maxYear = maxDate.getUTCFullYear();

            ticks = [];
            for (let y = minYear + 1; y <= maxYear; y++) {
                ticks.push(new Date(Date.UTC(y, 0, 1)));
            }
        });
    });

    let daysDiff = $state(0);
    let yearsDiff = $state(0);

    let isLongRange = $state(false);
    let isShortRange = $state(false);
    let ticks: Date[] = $state([]);

    const formatYear = (d: Date) => d.getFullYear().toString();
    const formatDayFull = (d: Date) =>
        d.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
        });
</script>

{#await itemDataPromise}
    <Skeleton class="h-[500px] w-full" />
{:then}
    {#if data}
        <Chart.Container
            config={chartConfig}
            class="h-full max-h-[500px] w-full"
        >
            <AreaChart
                {data}
                x="date"
                y="price"
                props={{
                    area: { curve: curveNatural, motion: "tween" },
                    xAxis: {
                        ticks: isLongRange ? () => ticks : null,
                        format: isLongRange ? formatYear : formatDayFull, // long: just year; short: full date
                    },
                    yAxis: { format: currencyManager.currencyFormaterWithKs },
                }}
            >
                {#snippet marks()}
                    <LinearGradient class="from-primary to-primary/1" vertical>
                        {#snippet children({ gradient })}
                            <Area
                                line={{ class: "stroke-primary" }}
                                fill={gradient}
                            />
                        {/snippet}
                    </LinearGradient>
                {/snippet}
                {#snippet tooltip({ context })}
                    <Tooltip.Root class="max-w-60">
                        {#snippet children({ data })}
                            <Tooltip.Header>
                                <span class="whitespace-break-spaces"
                                    >{context
                                        .x(data)
                                        .toLocaleDateString("de-DE")}</span
                                >
                            </Tooltip.Header>
                            <Tooltip.List>
                                <Tooltip.Item
                                    label="price"
                                    value={currencyManager.currencyFormater(
                                        data.price,
                                    )}
                                />
                            </Tooltip.List>
                        {/snippet}
                    </Tooltip.Root>
                {/snippet}
            </AreaChart>
        </Chart.Container>
    {/if}
{/await}

<style>
    :global(svg *) {
        user-select: none;
    }
</style>
