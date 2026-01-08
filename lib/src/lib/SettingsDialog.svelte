<script lang="ts">
    import CircleUserRound from "@lucide/svelte/icons/circle-user-round";
    import BadgeDollarSign from "@lucide/svelte/icons/badge-dollar-sign";
    import ReceiptText from "@lucide/svelte/icons/receipt-text";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import type { Currency } from "@betterinv/lib/types";
    import { currencyManager } from "./currency.svelte.ts";
    import type { HTMLAttributes } from "svelte/elements";
    import Label from "./components/ui/label/label.svelte";
    import * as Password from "./components/ui/password/index.js";
    import { Button } from "./components/ui/button/index.ts";
    import { env } from "$env/dynamic/public";
    import { toast } from "svelte-sonner";
    import * as Alert from "./components/ui/alert/index.ts";
    import { onMount } from "svelte";
    import { biFetch } from "./biFetch.ts";

    let {
        open = $bindable(true),
    }: {
        open: boolean;
    } = $props();

    const menuItems = [
        {
            id: "account",
            title: "Account Settings",
            icon: CircleUserRound,
        },
        {
            id: "billing",
            title: "Billing",
            icon: ReceiptText,
        },
        {
            id: "price",
            title: "Price Settings",
            icon: BadgeDollarSign,
        },
    ];

    $effect(() => {
        if (!open) closing();
    });

    let hasPassword = $state(false);

    onMount(() => {
        biFetch<{ hasPassword: boolean }>(
            `${env.PUBLIC_SERVER_URL}/api/has-password`,
            {
                method: "GET",
            },
        ).then((json) => {
            hasPassword = json.hasPassword;
        });
    });

    function closing() {
        currentPassword = "";
        newPassword = "";
        confirmNewPassword = "";
    }

    let activeTab = $state("account");

    let currentPassword = $state("");
    let newPassword = $state("");
    let confirmNewPassword = $state("");

    let changePasswordErrors: string[] = $state([]);

    async function changePassword() {
        await biFetch<{ success: boolean; errors: string[] }>(
            `${env.PUBLIC_SERVER_URL}/api/change-password`,
            {
                method: "POST",
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmNewPassword,
                }),
            },
        )
            .then((json) => {
                if (json.success) {
                    toast.info("Your password has been updated!");
                    currentPassword = "";
                    newPassword = "";
                    confirmNewPassword = "";
                } else {
                    changePasswordErrors = json.errors;
                    toast.error("Failed to change your password", {
                        duration: 5000,
                    });
                }
            })
            .catch(() => {
                toast.error("Failed to reach the server", {
                    duration: 5000,
                });
            });
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content
        class="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]"
        trapFocus={false}
    >
        <Sidebar.Provider class="items-start">
            <Dialog.Title class="sr-only">Settings</Dialog.Title>
            <Dialog.Description class="sr-only"
                >Customize your settings here.</Dialog.Description
            >

            <Sidebar.Root variant="inset" class="hidden md:flex">
                <Sidebar.Content>
                    <Sidebar.Group>
                        <Sidebar.GroupContent>
                            <Sidebar.Menu>
                                {#each menuItems as item}
                                    <Sidebar.MenuItem>
                                        <Sidebar.MenuButton
                                            isActive={activeTab === item.id}
                                            class="text-base"
                                        >
                                            {#snippet child({
                                                props,
                                            }: {
                                                props: HTMLAttributes<HTMLButtonElement>;
                                            })}
                                                <button
                                                    onclick={() => {
                                                        activeTab = item.id;
                                                    }}
                                                    {...props}
                                                >
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </button>
                                            {/snippet}
                                        </Sidebar.MenuButton>
                                    </Sidebar.MenuItem>
                                {/each}
                            </Sidebar.Menu>
                        </Sidebar.GroupContent>
                    </Sidebar.Group>
                </Sidebar.Content>
            </Sidebar.Root>
            <Sidebar.Inset class="w-full p-4 min-h-[50%]">
                {#if activeTab === "account"}
                    <div class="flex flex-col gap-6 w-[80%] mx-auto">
                        {#if hasPassword}
                            <h2 class="mb-0 text-xl">Change Password</h2>
                            <div class="grid gap-2">
                                <div class="flex items-center">
                                    <Label for="current-password"
                                        >Current password</Label
                                    >
                                </div>
                                <Password.Root>
                                    <Password.Input
                                        name="currentPassword"
                                        id="current-password"
                                        placeholder="**********"
                                        bind:value={currentPassword}
                                    >
                                        <Password.ToggleVisibility />
                                    </Password.Input>
                                </Password.Root>
                            </div>
                            <div class="grid gap-2">
                                <div class="flex items-center">
                                    <Label for="password">New password</Label>
                                </div>
                                <Password.Root>
                                    <Password.Input
                                        name="password"
                                        id="password"
                                        placeholder="**********"
                                        bind:value={newPassword}
                                    >
                                        <Password.ToggleVisibility />
                                    </Password.Input>
                                    <Password.Strength min={2} />
                                </Password.Root>
                            </div>
                            <div class="grid gap-2">
                                <div class="flex items-center">
                                    <Label for="confirm-password"
                                        >Confirm new password</Label
                                    >
                                </div>
                                <Password.Root>
                                    <Password.Input
                                        name="confirmPassword"
                                        id="confirm-password"
                                        placeholder="**********"
                                        bind:value={confirmNewPassword}
                                    >
                                        <Password.ToggleVisibility />
                                    </Password.Input>
                                </Password.Root>
                            </div>
                            <div class="flex justify-end">
                                <Button onClickPromise={changePassword}
                                    >Save new password</Button
                                >
                            </div>
                            {#if changePasswordErrors.length > 0}
                                <Alert.Root variant="destructive">
                                    <Alert.Title
                                        >Could not change your password</Alert.Title
                                    >
                                    <Alert.Description>
                                        {#each changePasswordErrors as error}
                                            <div>{error}</div>
                                        {/each}
                                    </Alert.Description>
                                </Alert.Root>
                            {/if}
                        {/if}
                    </div>
                {/if}
                {#if activeTab === "price"}
                    <Select.Root
                        type="single"
                        onValueChange={(value: string) => {
                            console.log("setting value", value);
                            currencyManager.changeCurrency(value as Currency);
                        }}
                    >
                        <Select.Trigger class="w-[180px]"
                            >{currencyManager.currency}</Select.Trigger
                        >
                        <Select.Content>
                            {#each currencyManager.currencies as currency}
                                <Select.Item value={currency}
                                    >{currency}</Select.Item
                                >
                            {/each}
                        </Select.Content>
                    </Select.Root>
                {/if}
            </Sidebar.Inset>
        </Sidebar.Provider>
    </Dialog.Content>
</Dialog.Root>
