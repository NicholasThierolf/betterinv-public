import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
const keytar = req("keytar") as typeof import("keytar");

export async function getPassword(user: string) {
    return await keytar.getPassword("CS2-inv", user);
}

export async function setPassword(user: string, password: string) {
    await keytar.setPassword("CS2-inv", user, password);
}

export async function deletePassword(user: string) {
    keytar.deletePassword("CS2-inv", user);
}