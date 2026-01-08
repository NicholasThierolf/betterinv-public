<script lang="ts">
    import "../app.css";
    import { ModeWatcher } from "mode-watcher";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import { ConfirmDeleteDialog, ItemPopover } from "@betterinv/lib";

    let { children } = $props();
</script>

<svelte:head>
    <title>Betterinv</title>
</svelte:head>

<ModeWatcher />
<Tooltip.Provider>
    {@render children?.()}
</Tooltip.Provider>
<ItemPopover />
<ConfirmDeleteDialog />
