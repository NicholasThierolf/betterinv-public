<script lang="ts">
    import * as ItemElement from "./components/ui/item/index.ts";
    import { Skeleton } from "./components/ui/skeleton/index.ts";
</script>

<ItemElement.Root variant="outline" class="w-50">
    <ItemElement.Header class="relative">
        <Skeleton class="w-full h-[102px]" />
    </ItemElement.Header>
    <ItemElement.Content>
        <Skeleton class="w-full h-10" />
        <Skeleton class="w-full h-8 mt-1" />
    </ItemElement.Content>
</ItemElement.Root>
