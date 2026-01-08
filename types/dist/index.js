// export interface SyncMessage<T = any> extends message {
//     data: {
//         stateName: string;
//         stateData: T
//     }
// }
export var AccountError;
(function (AccountError) {
    AccountError[AccountError["SteamIDMissmatch"] = 0] = "SteamIDMissmatch";
})(AccountError || (AccountError = {}));
export var ItemType;
(function (ItemType) {
    ItemType[ItemType["Container"] = 0] = "Container";
    ItemType[ItemType["Case"] = 1] = "Case";
    ItemType[ItemType["Sticker"] = 2] = "Sticker";
    ItemType[ItemType["Skin"] = 3] = "Skin";
    ItemType[ItemType["MusicKit"] = 4] = "MusicKit";
    ItemType[ItemType["Graffiti"] = 5] = "Graffiti";
    ItemType[ItemType["Other"] = 6] = "Other";
})(ItemType || (ItemType = {}));
