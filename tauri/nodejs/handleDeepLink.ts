import { createRequire } from "node:module";
import { setPassword } from "./password";

export async function handleDeepLink(link: string): Promise<{ success: boolean, error?: string }> {
    if (!link) return { success: false, error: "Invalid login token" };

    const url = new URL(link);
    if (url.hostname !== "callback") return { success: false, error: "Invalid login token" };
    const ott = url.searchParams.get("ott");
    if (!ott) return { success: false, error: "Invalid login token" };

    const res = await fetch(`${process.env.PUBLIC_SERVER_URL}/api/native/ott-exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ott })
    });

    if (!res.ok) {
        return { success: false, error: "Could not exchange token" };
    }

    const { token, tokenType } = await res.json();
    await setPassword("user", JSON.stringify({ tokenType, token }));

    return { success: true };
}