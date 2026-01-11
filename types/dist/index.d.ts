export type EventName = "inventory-data" | "account-data" | "request-qr-code-usage" | "qr-code-login-error" | "qr-code-login-success" | "qr-code-changed" | "browser-login-received" | "sync-data" | "log";
export interface NodeToSvelte {
    id?: string;
    type: 'response' | 'event';
    eventName?: EventName;
    data: any;
    error?: string;
}
export type RequestName = "add-account" | "stop-adding-account" | "login-account" | "sync-inventory" | "logout" | "sync-data" | "is-logged-in" | "get-accounts" | "get-price-history" | "send-to-container" | "remove-from-container" | "fetch-from-server" | "log-in" | "get-profile-picture" | "handle-deep-link" | "send-stored-logs";
export declare enum AccountError {
    SteamIDMissmatch = 0
}
export declare enum ItemType {
    Container = 0,
    Case = 1,
    Sticker = 2,
    Skin = 3,
    MusicKit = 4,
    Graffiti = 5,
    Other = 6
}
export interface MinimalItem {
    marketHashName: string;
    amount: number;
    type: ItemType;
    image: string;
}
export interface Item extends MinimalItem {
    shortName: string;
    ids: string[];
    image: string;
    customName: string;
    itemCount?: number;
    marketable: boolean;
    wear?: number;
    wearText?: string;
}
export interface InventoryData {
    loaded: boolean;
    inventory: Item[];
    containers: Record<string, Item[]>;
    mainInventoryItemCount: number;
    containersLoaded: {
        total: number;
        loaded: number;
    };
}
export type CSGOItem = {
    id: string;
    def_index: number;
    quality?: number;
    rarity?: number;
    paint_index?: string;
    attribute?: {
        def_index: number;
        value?: number | null;
        value_bytes?: Record<string, number>;
    }[];
    casket_id?: number;
    tradable_after?: Date;
    openLink?: string;
    flags: number;
    position: number;
};
export type Currency = "EUR" | "USD" | "JPY" | "CZK" | "DKK" | "GBP" | "HUF" | "PLN" | "RON" | "SEK" | "CHF" | "ISK" | "NOK" | "TRY" | "AUD" | "BRL" | "CAD" | "CNY" | "HKD" | "IDR" | "ILS" | "INR" | "KRW" | "MXN" | "MYR" | "NZD" | "PHP" | "SGD" | "THB" | "ZAR";
export type DayRates = [
    USD: number,
    JPY: number,
    CZK: number,
    DKK: number,
    GBP: number,
    HUF: number,
    PLN: number,
    RON: number,
    SEK: number,
    CHF: number,
    ISK: number,
    NOK: number,
    TRY: number,
    AUD: number,
    BRL: number,
    CAD: number,
    CNY: number,
    HKD: number,
    IDR: number,
    ILS: number,
    INR: number,
    KRW: number,
    MXN: number,
    MYR: number,
    NZD: number,
    PHP: number,
    SGD: number,
    THB: number,
    ZAR: number
];
