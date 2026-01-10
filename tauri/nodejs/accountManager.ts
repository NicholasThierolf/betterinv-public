// import { SteamUser } from "steam-user";
import { LoginSession, EAuthTokenPlatformType } from 'steam-session';
import SteamUser from 'steam-user';
import GlobalOffensive from 'globaloffensive';
import { communicator } from './communicator';
import { AccountError, CSGOItem, Item, ItemType } from '@betterinv/types';
import QRCode from 'qrcode';
import setCookie from "set-cookie-parser";
import path from 'node:path';
import { jwtDecode } from "jwt-decode";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { enrichItems, minifyInv } from './enrichItems.ts';
import { Inventory } from './inventory.ts';
import { log } from './logger.ts';

//TODO: handle logout from steam account event

const APPDATA_PATH = process.env.APPDATA ?? process.env.HOME;

type AccountInfo = {
    name: string,
    steamID: string,
}

export class Account {

    private static _accounts: Account[] = [];

    static waitingQRCodes: Record<string, CallableFunction> = {};

    static async loadAccounts() {
        const dataPath = path.join(APPDATA_PATH, "/cs2-inv/accounts");
        log("data-path: " + dataPath);

        if (!existsSync(dataPath))
            return;


        const files = readdirSync(dataPath).map((fileName) => {
            const file = JSON.parse(readFileSync(path.join(dataPath, fileName), "utf-8"));
            return file;
        });

        const accounts = await Promise.all(files.map((file) => {
            const refreshToken = file.refreshToken;
            const decoded = jwtDecode(refreshToken);
            const expires = decoded.exp ?? 0;
            const expired = (Date.now() / 1000) > expires;

            log("trying to add account..." + JSON.stringify(file.accountInfo))

            const newAccount = new Account(file.accountInfo);

            if (expired) {
                log("account expired")
                newAccount.refreshTokenExpired();
                return Promise.resolve(newAccount);
            }

            const promise: Promise<Account> = new Promise((resolve, reject) => {
                newAccount.on("authenticated", () => {
                    log("authenticated account");
                    resolve(newAccount);
                })
            });

            log("logging in with refresh tokens");
            newAccount.loginWithRefreshToken(refreshToken);
            return promise;
        }));

        accounts.forEach((account) => {
            this._accounts.push(account);
        });

        communicator.eventToSvelte("account-data", {
            accounts: Account.accounts
        });
    }

    static async loginAccount(steamID: string) {

        const account = this._accounts.find(account => account.steamID === steamID);

        if (account === undefined) throw new Error("Trying to log in account that does not exist");

        const url = await account.logIn();

        communicator.eventToSvelte("request-qr-code-usage", url);

        try {
            await new Promise((resolve, reject) => {
                account.on("authenticated", () => {
                    return resolve(true);
                });

                account.on("steamid-missmatch", () => {
                    communicator.eventToSvelte("qr-code-login-error", {
                        error: AccountError.SteamIDMissmatch
                    });
                    return reject();
                })

                this.waitingQRCodes[url] = reject;
            })
        } catch (err) {
            return;
        }

        communicator.eventToSvelte("qr-code-login-success", { steamID });
    }

    static async addAccount() {
        const newAccount = new Account(null);
        const url = await newAccount.logIn();

        communicator.eventToSvelte("request-qr-code-usage", url);

        try {
            await new Promise((resolve, reject) => {
                newAccount.on("authenticated", () => {
                    return resolve(true);
                });

                this.waitingQRCodes[url] = reject;
            })
        } catch (err) {
            return;
        }

        this._accounts.push(newAccount);

        communicator.eventToSvelte("qr-code-login-success", { steamID: "nothing" });
    }

    static async loginWithCredentials(username: string, password: string, steamguard: string, steamId?: string): Promise<string | null> {
        if (steamId) {
            //TODO: relog with credentials
        }

        const newAccount = new Account(steamId ? { steamID: steamId, name: "" } : null);

        return newAccount.loginWithCredentials(username, password, steamguard);
    }


    static getAccount(steamID: string) {
        return this._accounts.find((account: Account) => {
            return account.steamID === steamID;
        });
    }

    static stopAddingAccount(url: string) {
        this.waitingQRCodes[url]?.();
    }

    static get accounts() {
        return this._accounts.map((account) => {
            return {
                items: account.allItems,
                name: account.name,
                steamID: account.steamID,
                loginExpired: account.loginExpired,
            }
        })
    }

    static get rawAccounts() {
        return this._accounts;
    }

    private initialAccountInfo: AccountInfo | null;

    private _loggedIn = false;
    private _loginExpired = false;

    private _loginSession: LoginSession | undefined;
    private _steamUser: SteamUser;
    private _csgo: GlobalOffensive;

    private _csgoActive = false;

    private _inventory: Inventory | null = null;;

    constructor(accountInfo: AccountInfo | null) {

        this.initialAccountInfo = accountInfo;

        this.on("changedData", () => {
            communicator.eventToSvelte("account-data", {
                accounts: Account.accounts
            });
        });

        this.on("authenticated", () => {
            this.emit("changedData");
        })

        this.on("inventory", () => {
            this._inventory = new Inventory(`${this.accountInfo?.steamID}`);
            this.emit("changedData");

            const enrichedInv = enrichItems(this._csgo.inventory, this.steamID);
            this._inventory.loadedInventory(enrichedInv);

            this.loadAllContainers().then(() => {
                if (this._inventory)
                    this._inventory.loaded = true;
                this._csgo.on("itemRemoved", (item: CSGOItem) => {
                    if (item.casket_id !== undefined) return;
                    this._inventory?.itemRemoved(item.id);
                });
                this._csgo.on("itemAcquired", (item: CSGOItem) => {
                    if (item.casket_id !== undefined) return;
                    log("no casket id")
                    this._inventory?.itemsAdded(enrichItems([item], this.steamID));
                });
                this._csgo.on("itemCustomizationNotification", (itemIds: string[], type: number) => {
                    if (type === GlobalOffensive.ItemCustomizationNotification.CasketAdded) {
                        itemIds.forEach((containerID: string) => {
                            this.getContainerContents(containerID).then(loadedContainer => this._inventory?.loadedContainer(containerID, loadedContainer));
                        })
                    }
                    if (type === GlobalOffensive.ItemCustomizationNotification.CasketRemoved) {
                        itemIds.forEach((containerID: string) => {
                            this.getContainerContents(containerID).then(loadedContainer => this._inventory?.loadedContainer(containerID, loadedContainer));
                        })
                    }
                });
            })
        });

        this.createNewLoginSession(accountInfo?.steamID ?? null);

    }

    private createNewLoginSession(steamID: string | null = null) {
        this._loginSession = new LoginSession(EAuthTokenPlatformType.SteamClient);

        this._loginSession.loginTimeout = 120000;

        this._loginSession.on("authenticated", () => {
            if (!this._loginSession) throw Error("Login Session is undefined");
            if (steamID !== null && steamID !== `${this._loginSession.steamID}`) {
                this.emit("steamid-missmatch");

                this.createNewLoginSession(steamID);

                this.logIn().then((url) => {
                    communicator.eventToSvelte("qr-code-changed", url);
                });
                return;
            }
            this.loginSteamUser();
        });

        this._loginSession.on("error", (error) => {
            log("login session error encountered!", error);
        })
    }

    private loginSteamUser() {
        if (!this._loginSession) throw Error("Login Session is undefined");
        const refreshToken = this._loginSession.refreshToken;

        this._steamUser = new SteamUser({
            autoRelogin: true
        });
        this._steamUser.logOn({
            refreshToken
        });

        this._steamUser.on("loggedOn", (details: any, parental: any) => {
            this._loggedIn = true;
            this._loginExpired = false;
            this.emit("authenticated");
            this.startCS();
            this.saveAccountData();
        })

        this._steamUser.on("accountInfo", (name: string) => {
            this.saveAccountData(name);
        })
    }

    async startCS() {
        if (!this._loggedIn) throw Error("Can't log into CS without being logged into Steam");
        this._csgo = new GlobalOffensive(this._steamUser);

        this._csgo.on("connectedToGC", () => {
            log("[Account] connected to global offensive!");
            this._csgoActive = true;

            this.emit("inventory");
        });

        this._csgo.on("disconnectedFromGC", () => {
            log("[Account] disconnected from global offensive!");
            this._csgoActive = false;
        })

        this._steamUser.gamesPlayed([730]);

    }

    refreshTokenExpired() {
        this._loginExpired = true;
    }

    async loginWithRefreshToken(refreshToken: string) {
        if (this._loginExpired) throw new Error("Trying to log in with expired refresh token");
        if (!this._loginSession) throw Error("Login Session is undefined");
        this._loginSession.refreshToken = refreshToken;
        this.loginSteamUser();
    }

    async logIn() {
        if (!this._loginSession) throw Error("Login Session is undefined");
        try {
            const qrSession = await this._loginSession.startWithQR();
            const url = qrSession.qrChallengeUrl ?? "";

            const qrCode = await QRCode.toDataURL(url)

            return qrCode;
        } catch (err) {
            log("err", err);
            throw new Error("Steam appears to be having issues. Come back later");
        }
    }

    async loginWithCredentials(username: string, password: string, steamguard: string): Promise<string | null> {

        if (!this._loginSession) throw Error("Login Session is undefined");

        const promise = new Promise((resolve: (steamID: string | null) => void, reject) => {
            this.on("authenticated", () => {
                resolve(this.accountInfo?.steamID ?? null);
            });
        })

        await this._loginSession.startWithCredentials({
            accountName: username,
            password: password,
            steamGuardCode: steamguard,
        });

        return promise;
    }

    saveAccountData(fallbackName: string | null = null) {
        if (!this._loginSession) throw Error("Login Session is undefined");
        const dataPath = path.join(APPDATA_PATH, "/cs2-inv/accounts");

        const steamID = this._steamUser.steamID;
        let name = this._steamUser?.accountInfo?.name ?? fallbackName;
        const refreshToken = this._loginSession.refreshToken;

        const filePath = path.join(dataPath, `/${steamID}.json`);

        if (!existsSync(dataPath))
            mkdirSync(dataPath);
        writeFileSync(filePath, JSON.stringify({
            accountInfo: {
                steamID: `${steamID}`,
                name,
            },
            refreshToken,
        }));
    }

    private get accountInfo(): AccountInfo | null {
        if (this._steamUser?.accountInfo) return {
            name: this._steamUser.accountInfo.name,
            steamID: this._steamUser.steamID,
        };
        return this.initialAccountInfo;
    }

    get allItems() {
        if (!this._csgoActive) return [];
        return enrichItems(this._csgo.inventory, this.steamID);
    }

    get name() {
        return this.accountInfo?.name;
    }

    get steamID() {
        return `${this.accountInfo?.steamID}`;
    }

    get loginExpired() {
        return this._loginExpired;
    }

    getContainerContents(containerID: string): Promise<Item[]> {
        return new Promise((resolve, reject) => {
            this._csgo.getCasketContents(containerID, (err: Error | null, items: any[]) => {
                if (err !== null) return reject(err);
                const richItems = enrichItems(items, this.steamID, containerID);
                return resolve(richItems);
            })
        })
    }

    async addToContainer(itemID: string, containerID: string) {
        return new Promise((resolve, reject) => {
            this._csgo.addToCasket(containerID, itemID);
            const listener = (item: CSGOItem) => {
                if (item.id === itemID) {
                    resolve(true);
                    this._csgo.off("itemRemoved", listener);
                }
            };
            this._csgo.on("itemRemoved", listener);
        })
    }

    async removeFromContainer(itemID: string, containerID: string) {
        return new Promise((resolve, reject) => {
            this._csgo.removeFromCasket(containerID, itemID);
            const listener = (item: CSGOItem) => {
                if (item.id === itemID) {
                    log("item acquired received!");
                    resolve(true);
                    this._csgo.off("itemAcquired", listener);
                }
            };
            this._csgo.on("itemAcquired", listener);
        })

    }

    async loadAllContainers() {
        const items = this.allItems;
        const containers = items.filter(item => item.type === ItemType.Container);
        for (let i = 0; i < containers.length; i++) {
            const loadedContainer = await this.getContainerContents(containers[i].ids[0]);
            this._inventory?.loadedContainer(containers[i].ids[0], loadedContainer);
        }
        return minifyInv(items);
    }

    async getCookies(): Promise<string> {
        if (!this._loginSession) throw Error("Login Session is undefined");
        const refreshToken = this._loginSession.refreshToken;
        const webLoginSession = new LoginSession(EAuthTokenPlatformType.WebBrowser);
        webLoginSession.refreshToken = refreshToken;
        const rawCookies = await webLoginSession.getWebCookies();
        const parsedCookies = setCookie.parse(rawCookies);

        const cookieHeader = parsedCookies.filter((cookie: any) => cookie.domain === "steamcommunity.com").map((cookie: any) => {
            return `${cookie.name}=${cookie.value}`;
        }).join("; ");

        return cookieHeader;
    }

    private listener: Record<string, CallableFunction[]> = {};

    on(event: string, callback: CallableFunction) {
        if (this.listener[event]) this.listener[event].push(callback)
        else this.listener[event] = [callback];
    }

    private emit(event: string) {
        this.listener[event]?.forEach(callback => callback());
    }
}