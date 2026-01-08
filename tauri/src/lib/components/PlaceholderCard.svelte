<script lang="ts">
    import * as Item from "$lib/components/ui/item/index.js";
    import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>

<Item.Root variant="outline" class="w-50">
    <Item.Header><Skeleton class="h-30 w-full rounded-4" /></Item.Header>
    <Item.Content>
        <Item.Title class="w-full"
            ><Skeleton class="h-4 w-full rounded-4" /></Item.Title
        >
        <Item.Description
            ><Skeleton class="h-10 w-full rounded-4" /></Item.Description
        >
    </Item.Content>
</Item.Root>
