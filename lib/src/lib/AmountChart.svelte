<script lang="ts">
    import * as Card from "./components/ui/card/index.ts";
    import * as Chart from "./components/ui/chart/index.ts";
    import * as ToggleGroup from "./components/ui/toggle-group/index.ts";
    import type { PricedMinimalItem } from "./types.ts";
    import { scaleBand } from "d3-scale";
    import { BarChart, Tooltip } from "layerchart";
    import { currencyManager } from "./currency.svelte.ts";

    let { data, class: className = "" } = $props<{
        data: PricedMinimalItem[];
        class?: string;
    }>();

    const chartConfig = {} satisfies Chart.ChartConfig;

    const truncateLabel = (label: string, max = 16) =>
        label.length > max ? label.slice(0, max - 1) + "…" : label;

    let type = $state<"item-count" | "item-value">("item-count");
</script>

<Card.Root class={`pl-25 pr-1 gap-0 ${className}`}>
    <Card.Header>
        <Card.Title>Your top 20 items</Card.Title>
        <Card.Action class="flex items-center">
            <ToggleGroup.Root
                size="sm"
                variant="outline"
                type="single"
                bind:value={type}
            >
                <ToggleGroup.Item value="item-count"
                    >By item count</ToggleGroup.Item
                >
                <ToggleGroup.Item value="item-value"
                    >By total value</ToggleGroup.Item
                >
            </ToggleGroup.Root>
        </Card.Action>
        <Card.Description
            >By {type === "item-count"
                ? "item count"
                : "total value"}</Card.Description
        >
    </Card.Header>
    <Card.Content>
        <Chart.Container config={chartConfig} class="h-[400px] w-full">
            <BarChart
                data={type === "item-count"
                    ? data.slice(0, 20).map((item: PricedMinimalItem) => {
                          return {
                              name: item.marketHashName,
                              amount: item.amount,
                              value: (item.price ?? 0) * item.amount,
                              image: item.image,
                          };
                      })
                    : data
                          .toSorted(
                              (a: PricedMinimalItem, b: PricedMinimalItem) => {
                                  return (
                                      (b.price ?? 0) * b.amount -
                                      (a.price ?? 0) * a.amount
                                  );
                              },
                          )
                          .slice(0, 20)
                          .map((item: PricedMinimalItem) => {
                              return {
                                  name: item.marketHashName,
                                  amount: item.amount,
                                  value: (item.price ?? 0) * item.amount,
                                  image: item.image,
                              };
                          })}
                y="name"
                yScale={scaleBand().padding(0.25)}
                x={type === "item-count" ? "amount" : "value"}
                orientation="horizontal"
                props={{
                    bars: { class: "fill-primary" },
                    yAxis: {
                        format: (d: string) => truncateLabel(d, 16),
                    },
                    xAxis: {
                        format:
                            type === "item-count"
                                ? undefined
                                : currencyManager.currencyFormaterWithKs,
                    },
                }}
            >
                {#snippet tooltip({ context })}
                    <Tooltip.Root class="max-w-60">
                        {#snippet children({ data })}
                            <Tooltip.Header
                                ><img
                                    src={data.image}
                                    alt=""
                                    class="w-6 h-auto"
                                />
                                <span class="whitespace-break-spaces"
                                    >{context.y(data)}</span
                                >
                            </Tooltip.Header>
                            <Tooltip.List>
                                <Tooltip.Item
                                    label="Amount"
                                    value={data.amount}
                                />
                                <Tooltip.Item
                                    label="Total value"
                                    value={currencyManager.currencyFormater(
                                        data.value,
                                    )}
                                />
                            </Tooltip.List>
                        {/snippet}
                    </Tooltip.Root>
                {/snippet}
            </BarChart>
        </Chart.Container>
    </Card.Content>
</Card.Root>
