let customFetch: <T>(url: string, options?: RequestInit) => Promise<T>;

let waitingResolve: (v: boolean) => void;
let waitingPromise = new Promise((resolve) => {
    waitingResolve = resolve;
})

export async function initBiFetch(fun: <T>(url: string, options?: RequestInit) => Promise<T>) {
    customFetch = fun;
    waitingResolve?.(true);
}

export async function biFetch<T>(url: string, options?: RequestInit): Promise<T> {
    await waitingPromise;
    return customFetch(url, options ?? {});
}