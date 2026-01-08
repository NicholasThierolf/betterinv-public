<script lang="ts">
    import * as Card from "./components/ui/card/index.ts";
    import TrendingUp from "@lucide/svelte/icons/trending-up";
    import TrendingDown from "@lucide/svelte/icons/trending-down";
    import TrendingSideways from "@lucide/svelte/icons/move-right";
    import { Badge } from "./components/ui/badge/index.ts";
    import { currencyManager } from "./currency.svelte.ts";

    let {
        title,
        description,
        value,
        change,
        amount,
    }: {
        title: string;
        description?: string;
        value: number;
        change: number;
        amount: number;
    } = $props();
</script>

<Card.Root class="min-w-80 h-50 gap-3">
    <Card.Header>
        <Card.Description>{title}</Card.Description>

        <Card.Action>
            <Badge variant="outline">
                {#if change < 0}
                    <TrendingDown class="mr-1" />
                {/if}
                {#if change > 0}
                    <TrendingUp class="mr-1" />
                {/if}
                {#if change === 0}
                    <TrendingSideways class="mr-1" />
                {/if}
                <span
                    class:text-red-600={change < 0}
                    class:text-green-600={change > 0}
                    >{Math.abs(change).toFixed(2)}%</span
                >
            </Badge>
        </Card.Action>
    </Card.Header>
    <Card.Content>
        <Card.Title
            class="@[250px]/card:text-4xl text-3xl font-semibold tabular-nums"
            >{currencyManager.currencyFormater(value)}</Card.Title
        >
    </Card.Content>
    <Card.Footer class="flex-col items-start gap-1 text-sm mt-auto">
        <div class="line-clamp-1 flex gap-2 font-medium">
            {description}
        </div>
        <div class="text-muted-foreground">
            You own {amount === 0 ? "none" : amount} of those
        </div>
    </Card.Footer>
</Card.Root>
