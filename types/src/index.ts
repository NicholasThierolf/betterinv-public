export type EventName = "inventory-data"
    | "account-data"
    | "request-qr-code-usage"
    | "qr-code-login-error"
    | "qr-code-login-success"
    | "qr-code-changed"
    | "browser-login-received"
    | "sync-data"
    | "log";


export interface NodeToSvelte {
    id?: string;
    type: 'response' | 'event';
    eventName?: EventName;
    data: any;
    error?: string;
}

export type RequestName = "add-account"
    | "stop-adding-account"
    | "login-account"
    | "sync-inventory"
    | "logout"
    | "sync-data"
    | "is-logged-in"
    | "get-accounts"
    | "get-price-history"
    | "send-to-container"
    | "remove-from-container"
    | "fetch-from-server"
    | "log-in"
    | "get-profile-picture"
    | "handle-deep-link"
    | "send-stored-logs";

// export interface SyncMessage<T = any> extends message {
//     data: {
//         stateName: string;
//         stateData: T
//     }
// }

export enum AccountError {
    SteamIDMissmatch
}

export enum ItemType {
    Container,
    Case,
    Sticker,
    Skin,
    MusicKit,
    Graffiti,
    Other
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
    loaded: boolean,
    inventory: Item[],
    containers: Record<string, Item[]>,
    mainInventoryItemCount: number,
}

export type CSGOItem = {
    id: string;
    def_index: number;

    quality?: number; // StatTrak, etc.
    rarity?: number;
    paint_index?: string;
    attribute?: { def_index: number; value?: number | null; value_bytes?: Record<string, number> }[];
    casket_id?: number;
    tradable_after?: Date;
    openLink?: string;
    flags: number;
    position: number;
};