<script lang="ts">
    import type { Item } from "$lib/types";
    import * as ItemElement from "$lib/components/ui/item/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import Plus from "@lucide/svelte/icons/plus";

    const { item, onclick }: { item: Item; onclick: CallableFunction } =
        $props();
</script>

<ItemElement.Root variant="outline" class="w-full">
    <ItemElement.Media>
        <img
            class="h-10"
            alt="storage container"
            src="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJG51EejH_XV0MGkITXE5AB094KtuwG0Exv1yMfkqXcCtvT_MPw5JPTKV2bDk7Z3sudtHSjr2w0ptCMWPT2u"
        />
    </ItemElement.Media>
    <ItemElement.Content>
        <ItemElement.Title>{item.wearText}</ItemElement.Title>
        <ItemElement.Description>{item.itemCount}</ItemElement.Description>
    </ItemElement.Content>
    <ItemElement.Actions>
        <Button
            size="icon"
            variant="outline"
            class="rounded-full cursor-pointer"
            aria-label="add"
            onclick={() => {
                onclick();
            }}
        >
            <Plus />
        </Button>
    </ItemElement.Actions>
</ItemElement.Root>
