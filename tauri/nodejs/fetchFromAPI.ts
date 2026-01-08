import { getPassword } from "./password";


export async function fetchFromAPI(path: string, options: any = {}) {
    const raw = await getPassword("user");
    const { token } = raw ? JSON.parse(raw) : { token: "" };

    let url = path.startsWith(process.env.PUBLIC_SERVER_URL ?? "") ? path : `${process.env.PUBLIC_SERVER_URL}${path}`;
    return fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`
        }
    });
}