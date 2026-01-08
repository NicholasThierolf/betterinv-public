<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { communicator } from "$lib/communicator";
    import { Button } from "$lib/components/ui/button";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import * as Password from "$lib/components/ui/password";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import * as InputOTP from "$lib/components/ui/input-otp/index.js";
    import { REGEXP_ONLY_DIGITS_AND_CHARS } from "bits-ui";
    import Info from "@lucide/svelte/icons/info";
    import {
        AccountError,
        ClientMessageType,
        MessageType,
        type message,
    } from "../../../../lib/types";
    import { onDestroy, onMount } from "svelte";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";

    let showError = $state(-1);

    let QRCode: string = $state("");

    let username = $state("");
    let password = $state("");
    let steamguard = $state("");

    let loading = $state(false);

    let formValid = $derived.by(() => {
        if (username.length < 1) return false;
        if (password.length < 1) return false;
        if (steamguard.length !== 5) return false;
        return true;
    });

    onMount(() => {
        page.data.QRCode.then((code: string) => {
            QRCode = code;
        });
    });

    onDestroy(() => {
        communicator.requestFromNode<void>(
            "stop-adding-account",
            page.data.QRCode,
        );
    });

    //TODO: this should probably be inside of onMount, but listeners currently cant be destoryed soooo...
    communicator.onEvent(
        "qr-code-login-success",
        (data: { steamID: string }) => {
            goto(`#/account/${data.steamID}`);
        },
    );

    communicator.onEvent(
        "qr-code-login-error",
        (data: { error: AccountError }) => {
            if (data.error === AccountError.SteamIDMissmatch) {
                console.log("found steam id missmatch!");
                showError = data.error;
            }
        },
    );

    communicator.onEvent("qr-code-changed", (url: string) => {
        QRCode = url;
    });

    async function logIn() {
        loading = true;

        await communicator
            .requestFromNode<string>("log-in", {
                username,
                password,
                steamguard,
                steamId: page.data.steamID,
            })
            .then((steamID: string) => {
                goto(`#/account/${steamID}`);
            });
    }
</script>

<section class="flex items-start justify-center-safe h-full">
    <Card.Root class="w-150 max-w-[70vw] px-10 box-border mt-20">
        <Card.Header>
            <Card.Title class="text-2xl">Add a Steam account</Card.Title>
            <Card.Description>
                {#if page.data.steamID}
                    Log back into your Steam Account to sync your Steam
                    inventory with Betterinv
                {:else}
                    Log in to a Steam Account to add it to Betterinv.
                {/if}
            </Card.Description>
        </Card.Header>
        <Card.Content>
            {#if showError === AccountError.SteamIDMissmatch}
                <Alert.Root variant="destructive" class="mb-6">
                    <Alert.Title>Steam ID Missmatch</Alert.Title>
                    <Alert.Description>
                        You did not log into the correct steam account!
                    </Alert.Description>
                </Alert.Root>
            {/if}
            <Tabs.Root value="qr" class="w-full box-border px-10">
                <Tabs.List class="mb-6">
                    <Tabs.Trigger value="qr">QR Code</Tabs.Trigger>
                    <Tabs.Trigger value="credentials">Credentials</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="credentials">
                    <Label for="username" class="mb-2">Account name</Label>
                    <Input
                        id="username"
                        class="mb-6"
                        placeholder="Steam account name"
                        bind:value={username}
                    />
                    <Label for="password" class="mb-2">Password</Label>
                    <Password.Root class="mb-6">
                        <Password.Input
                            id="password"
                            placeholder="••••••••••••••••"
                            bind:value={password}
                        >
                            <Password.ToggleVisibility />
                        </Password.Input>
                    </Password.Root>
                    <Label for="steamguard" class="mb-2">Steam Guard</Label>
                    <InputOTP.Root
                        maxlength={5}
                        id="steamguard"
                        bind:value={steamguard}
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    >
                        {#snippet children({ cells })}
                            <InputOTP.Group>
                                {#each cells as cell (cell)}
                                    <InputOTP.Slot {cell} class="uppercase" />
                                {/each}
                            </InputOTP.Group>
                        {/snippet}
                    </InputOTP.Root>
                    <Tooltip.Root>
                        <Tooltip.Trigger class="w-full"
                            ><Button
                                disabled={!formValid}
                                onClickPromise={logIn}
                                class="mt-6 w-full">Log in to Steam</Button
                            ></Tooltip.Trigger
                        >
                        {#if !formValid}
                            <Tooltip.Content>
                                <p>Please provide valid values</p>
                            </Tooltip.Content>
                        {/if}
                    </Tooltip.Root>
                </Tabs.Content>
                <Tabs.Content value="qr">
                    {#await page.data.QRCode}
                        <Skeleton
                            class="w-full m-auto rounded-lg aspect-square"
                        />
                    {:then}
                        <img
                            class="w-full m-auto rounded-lg"
                            src={QRCode}
                            alt="qr code"
                            style="image-rendering: pixelated;"
                        />
                    {:catch}
                        <Alert.Root variant="destructive" class="mb-6">
                            <Alert.Title>Error</Alert.Title>
                            <Alert.Description>
                                Could not load Login QR Code from Steam
                            </Alert.Description>
                        </Alert.Root>
                    {/await}
                </Tabs.Content>
            </Tabs.Root>
            <Alert.Root class="mt-6">
                <Info />
                <Alert.Description
                    >Betterinv does not store your login data. The app stores a
                    refresh token in a secure credentials store on your own
                    device. Your credentials never leave your device, and
                    Betterinv cannot access your account remotely.</Alert.Description
                >
            </Alert.Root>
        </Card.Content>
    </Card.Root>
</section>
