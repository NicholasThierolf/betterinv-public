export type DashboardData = {
    totalValue: number,
    last180Days: number[],
    allItems: MinimalItem[],
    typeStats: {
        cases: { value: number; amount: number; value7DaysAgo: number };
        skins: { value: number; amount: number; value7DaysAgo: number };
        containers: { value: number; amount: number; value7DaysAgo: number };
        stickers: { value: number; amount: number; value7DaysAgo: number };
        all: { value: number; amount: number; value7DaysAgo: number };
    },
    watchedItems: PricedMinimalItem[]
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

export interface PricedMinimalItem extends MinimalItem {
    price?: number;
    increaseLast7Days?: number;
    last7Days?: number[];
}

export type DatedPriceHistory = {
    prices: {
        date: Date;
        price: number;
    }[];
    lastUpdated: Date
}

export type UserPreferences = {
    currency: Currency,
}

export type Currency = "EUR" | "USD" | "CAD";