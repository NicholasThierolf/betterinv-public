<script lang="ts">
    import { getVersion } from "@tauri-apps/api/app";
    import ChartLine from "@lucide/svelte/icons/chart-line";
    import Rows3Icon from "@lucide/svelte/icons/rows-3";
    import Newspaper from "@lucide/svelte/icons/newspaper";
    import Bell from "@lucide/svelte/icons/bell";
    import ArrowDownUp from "@lucide/svelte/icons/arrow-down-up";
    import Settings from "@lucide/svelte/icons/settings";
    import Logout from "@lucide/svelte/icons/log-out";
    import { Badge } from "./ui/badge";
    import Plus from "@lucide/svelte/icons/plus";
    import CirclePlus from "@lucide/svelte/icons/circle-plus";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import ScanEye from "@lucide/svelte/icons/scan-eye";
    import { communicator } from "$lib/communicator";
    import { AppLogo, SettingsDialog } from "@betterinv/lib";
    import { LightSwitch } from "./ui/light-switch";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import ProfilePicture from "./ProfilePicture.svelte";
    import { accountState } from "$lib/accountManager.svelte";
    import { onMount } from "svelte";

    const portfolioLinks = [
        {
            link: "#/",
            icon: ChartLine,
            text: "Overview",
            badge: null,
        },
        {
            link: "#/items",
            icon: Rows3Icon,
            text: "Items",
            badge: null,
        },
        {
            link: "#/watchlist",
            icon: ScanEye,
            text: "Watchlist",
            badge: null,
        },
        {
            link: "#",
            icon: Newspaper,
            text: "News",
            badge: "Soon",
        },
        {
            link: "#",
            icon: Bell,
            text: "Alerts",
            badge: "Soon",
        },
        {
            link: "#",
            icon: ArrowDownUp,
            text: "Tradeups",
            badge: "Soon",
        },
    ];

    let settingsOpen = $state(false);

    let version = $state("…");

    onMount(async () => {
        version = await getVersion();
    });
</script>

<Sidebar.Root variant="inset">
    <Sidebar.Header>
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <AppLogo />
            </Sidebar.MenuItem>
        </Sidebar.Menu>
        <Sidebar.Separator />
    </Sidebar.Header>
    <Sidebar.Content>
        <Sidebar.Group>
            <Sidebar.GroupLabel>Portfolio</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#each portfolioLinks as item}
                        <Sidebar.MenuItem>
                            <Sidebar.MenuButton
                                size="lg"
                                isActive={page.url.hash === item.link}
                            >
                                {#snippet child({ props })}
                                    <a href={item.link} {...props}>
                                        <item.icon />
                                        <span>{item.text}</span>
                                        {#if item.badge}
                                            <Badge
                                                variant="secondary"
                                                class="ml-auto"
                                                >{item.badge}</Badge
                                            >{/if}
                                    </a>
                                {/snippet}
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/each}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
        <Sidebar.Group>
            <Sidebar.GroupLabel>Accounts</Sidebar.GroupLabel>
            <Sidebar.GroupAction title="Add Account">
                {#snippet child({ props })}
                    <a href="#/add" {...props} data-sveltekit-reload>
                        <Plus /> <span class="sr-only">Add Account</span>
                    </a>
                {/snippet}
            </Sidebar.GroupAction>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#each accountState.accounts as account (account.name)}
                        <Sidebar.MenuItem>
                            <Sidebar.MenuButton
                                size="lg"
                                isActive={page.url.hash.includes(
                                    `#/account/${account.steamID}`,
                                )}
                            >
                                {#snippet child({ props })}
                                    {#if account.loginExpired}
                                        <a
                                            href={`#/add/${account.steamID}`}
                                            {...props}
                                        >
                                            <ProfilePicture
                                                steamID={account.steamID}
                                            />
                                            <span>{account.name}</span>
                                            <Badge
                                                variant="destructive"
                                                class="ml-auto"
                                                >Not logged in</Badge
                                            >
                                        </a>
                                    {:else}
                                        <a
                                            href={`#/account/${account.steamID}`}
                                            {...props}
                                        >
                                            <ProfilePicture
                                                steamID={account.steamID}
                                            />
                                            <span>{account.name}</span>
                                        </a>
                                    {/if}
                                {/snippet}
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/each}
                    {#if accountState.accounts.length === 0}
                        <Sidebar.MenuItem>
                            <Sidebar.MenuButton size="lg">
                                {#snippet child({ props })}
                                    <a href="#/add" {...props}>
                                        <CirclePlus />
                                        <span>Add a steam Account</span>
                                    </a>
                                {/snippet}
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/if}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>
    <Sidebar.Footer>
        <Sidebar.Separator />
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <Sidebar.MenuButton size="lg" class="cursor-pointer">
                    {#snippet child({ props })}
                        <button
                            onclick={() => {
                                settingsOpen = true;
                            }}
                            {...props}
                        >
                            <Settings />
                            <span>Settings</span>
                        </button>
                    {/snippet}
                </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
                <Sidebar.MenuButton size="lg">
                    {#snippet child({ props })}
                        <button
                            onclick={() => {
                                communicator.requestFromNode("logout", null);
                                goto("#/login");
                            }}
                            {...props}
                        >
                            <Logout />
                            <span>Sign out</span>
                        </button>
                    {/snippet}
                </Sidebar.MenuButton>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
        <div class="flex gap-4 flex-wrap items-center">
            <LightSwitch /><a href="/imprint">Imprint</a><a href="/tos">ToS</a>
        </div>
        <div class="pl-2 text-xs my-2">
            v{version}
        </div>
    </Sidebar.Footer>
</Sidebar.Root>
<SettingsDialog bind:open={settingsOpen} />
