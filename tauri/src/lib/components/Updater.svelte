<script lang="ts">
    import { check, Update } from "@tauri-apps/plugin-updater";
    import { relaunch } from "@tauri-apps/plugin-process";
    import { onDestroy, onMount } from "svelte";
    import { Item } from "./ui/item";
    import { Button } from "./ui/button";
    import { Progress } from "./ui/progress";

    let showUpdateNotice = $state(false);
    let contentLength = $state(0);
    let downloaded = $state(0);
    let downloadedPercentage = $derived((downloaded / contentLength) * 100);

    function notifyUpdate() {
        showUpdateNotice = true;
    }

    async function actuallyUpdate() {
        if (!foundUpdate) return;
        await foundUpdate.downloadAndInstall((event) => {
            switch (event.event) {
                case "Started":
                    contentLength = event.data.contentLength ?? 0;
                    break;
                case "Progress":
                    downloaded += event.data.chunkLength;
                    break;
                case "Finished":
                    console.log("download finished");
                    break;
            }
        });

        await relaunch();
    }

    let foundUpdate: Update | null = null;
    let updateInterval: NodeJS.Timeout;

    onMount(() => {
        updateInterval = setInterval(
            async () => {
                const update = await check();
                if (update) {
                    foundUpdate = update;
                    notifyUpdate();
                }
            },
            1000 * 60 * 5,
        );
    });

    onDestroy(() => {
        if (updateInterval) clearInterval(updateInterval);
    });
</script>

{#if showUpdateNotice}
    <Item
        class="fixed top-4 right-4 bg-background border-primary text-md shadow-lg"
    >
        <div>
            A newer version of Betterinv is available! <Button
                onClickPromise={actuallyUpdate}
                class="ml-4">Update now</Button
            >
        </div>
        {#if contentLength > 0}
            <Progress value={downloadedPercentage} />
        {/if}</Item
    >
{/if}
