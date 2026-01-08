<script lang="ts">
    import * as Card from "./components/ui/card/index.ts";
    import * as ToggleGroup from "./components/ui/toggle-group/index.ts";
    import * as Chart from "./components/ui/chart/index.ts";
    import { AreaChart, LinearGradient, Area, Tooltip } from "layerchart";
    import { curveNatural } from "d3-shape";
    import type { DashboardData } from "./types.ts";
    import { currencyManager } from "./currency.svelte.ts";

    let { data, class: className } = $props<{
        data: DashboardData;
        class?: string;
    }>();

    const today = new Date();

    let days = $state("30");
    let showingData = $state(data.last180Days.slice(-30));

    let formatedValues: { date: Date; value: number }[] = $derived.by(() => {
        let vals = [];
        for (let i = showingData.length - 1, j = 0; i >= 0; i--, j++) {
            const now = new Date(today);
            now.setDate(now.getDate() - i);
            vals.unshift({
                date: now,
                value: showingData[j],
            });
        }
        return vals;
    });

    const chartConfig = {} satisfies Chart.ChartConfig;

    let yDomain: [number, number] = $derived.by(() => {
        const values = formatedValues.map(
            (d: { date: Date; value: number }) => d.value,
        );

        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.1;
        return [min - padding, max + padding];
    });

    function updateShowingData() {
        if (days === "7") showingData = data.last180Days.slice(-7);
        else if (days === "30") showingData = data.last180Days.slice(-30);
        else if (days === "90") showingData = data.last180Days.slice(-90);
        else showingData = data.last180Days;
    }

    $effect(() => {
        updateShowingData();
    });
</script>

<Card.Root class={`pl-5 pr-1 gap-0 ${className}`}>
    <Card.Header>
        <Card.Title>Last {days} days</Card.Title>
        <Card.Action class="flex items-center">
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
            </ToggleGroup.Root>
            &nbsp;Days
        </Card.Action>
        <Card.Description
            >{currencyManager.currencyFormater(
                data.totalValue,
            )}</Card.Description
        >
    </Card.Header>
    <Card.Content>
        <Chart.Container config={chartConfig} class="h-[400px] w-full">
            <AreaChart
                data={formatedValues}
                x="date"
                y="value"
                {yDomain}
                props={{
                    area: { curve: curveNatural, motion: "tween" },
                    yAxis: { format: currencyManager.currencyFormaterWithKs },
                    xAxis: {
                        format: (d: Date) =>
                            d.toLocaleDateString("de-DE", {
                                day: "numeric",
                                month: "numeric",
                            }),
                    },
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
                                    label="Value"
                                    value={currencyManager.currencyFormater(
                                        data.value,
                                    )}
                                />
                            </Tooltip.List>
                        {/snippet}
                    </Tooltip.Root>
                {/snippet}
            </AreaChart>
        </Chart.Container>
    </Card.Content>
</Card.Root>
