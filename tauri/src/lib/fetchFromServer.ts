import { communicator } from "./communicator";

export function fetchFromServer(url: string, options?: RequestInit): Promise<any> {
    return communicator.requestFromNode<any>("fetch-from-server", {
        url, options
    }) as Promise<any>
}