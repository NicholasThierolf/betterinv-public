<script lang="ts">
    import { communicator } from "$lib/communicator";
    import { ClientMessageType, MessageType } from "$lib/types";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button";
    import { Spinner } from "$lib/components/ui/spinner/index.js";
    import * as Item from "$lib/components/ui/item/index.js";
    import { onDestroy, onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { env } from "$env/dynamic/public";
    import { open } from "@tauri-apps/plugin-shell";
    import { onOpenUrl } from "@tauri-apps/plugin-deep-link";

    let loggingIn = $state(false);

    function login() {
        loggingIn = true;
        open(`${env.PUBLIC_SERVER_URL}/login?client=desktop`);
        setTimeout(
            () => {
                loggingIn = false;
            },
            1000 * 60 * 5,
        );
    }

    function register() {
        loggingIn = true;
        open(`${env.PUBLIC_SERVER_URL}/register?client=desktop`);
        setTimeout(
            () => {
                loggingIn = false;
            },
            1000 * 60 * 5,
        );
    }

    let urlsReceived = $state("");

    onMount(() => {
        onOpenUrl(async (urls) => {
            urlsReceived = urls[0];
            const result = await communicator.requestFromNode<{
                success: boolean;
                error?: string;
            }>("handle-deep-link", urls[0]);
            if (result.success) {
                return goto("/");
            }
            alert("Error!" + result.error);
        });
    });
</script>

<main class="w-full h-[100vh] flex items-center justify-center">
    <Card.Root class="w-full max-w-sm">
        <Card.Header>
            <Card.Title>Sign in to your account</Card.Title>
            {#if !loggingIn}
                <Card.Description
                    >Click the Button to Sign in to your account via a browser</Card.Description
                >
            {/if}
        </Card.Header>
        <Card.Content>
            {#if loggingIn}
                <Item.Root variant="muted">
                    <Item.Media>
                        <Spinner />
                    </Item.Media>
                    <Item.Content>
                        <Item.Title
                            >Waiting for you to complete the sign in process in
                            your browser...</Item.Title
                        >
                    </Item.Content>
                </Item.Root>
            {:else}
                <Button class="w-full mb-2" onclick={login}>Sign in</Button>
                <div class="text-sm mb-2 w-full text-center">or</div>
                <Button class="w-full" variant="outline" onclick={register}
                    >Create new account</Button
                >
            {/if}
            {urlsReceived}
        </Card.Content>
    </Card.Root>
</main>
