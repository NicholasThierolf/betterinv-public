<script lang="ts">
    import { communicator } from "$lib/communicator";
    import { ClientMessageType } from "$lib/types";
    import { onMount } from "svelte";
    import { Skeleton } from "./ui/skeleton";

    const { steamID }: { steamID: string } = $props();

    let url: Promise<string> | undefined = $state();

    onMount(() => {
        url = communicator.requestFromNode<string>(
            "get-profile-picture",
            steamID,
        );
    });
</script>

{#await url}
    <Skeleton class="w-6 h-6 rounded-full" />
{:then imgUrl}
    <img class="w-6 h-6 rounded-full" src={imgUrl} alt="" />
{/await}
