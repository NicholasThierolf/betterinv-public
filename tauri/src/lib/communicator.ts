import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { NodeToSvelte, EventName, RequestName } from "@betterinv/types";
import { initAccountManager } from './accountManager.svelte';

interface PendingRequest {
    resolve: (data: any) => void;
    reject: (reason: any) => void;
}

type EventHandler = (data: any) => void;

// --- Communicator Class ---

class Communicator {
    private pendingRequests = new Map<string, PendingRequest>();
    private eventListeners = new Map<string, Set<EventHandler>>();
    private initialized = false;

    public async init() {
        if (this.initialized) return;

        initAccountManager();

        this.onEvent("log", (message) => console.log("message from nodejs:", message))

        // Listen for ALL messages coming from the Rust backend (which come from Node)
        await listen<string>('node-message', (event) => {
            try {
                // The payload is the raw JSON string line from Node.js
                const message: NodeToSvelte = JSON.parse(event.payload);

                // Case 1: It is a response to a specific request
                if (message.id && this.pendingRequests.has(message.id)) {
                    const { resolve, reject } = this.pendingRequests.get(message.id)!;
                    if (message.error) {
                        reject(new Error(message.error));
                    } else {
                        resolve(message.data);
                    }
                    this.pendingRequests.delete(message.id);
                }

                // Case 2: It is a general event (e.g. "heartbeat")
                else if (message.type === 'event') {
                    if (!message.eventName) return;
                    this.broadcastEvent(message.eventName, message.data);
                }
            } catch (e) {
                console.error('Failed to parse backend message', e);
            }
        });

        this.initialized = true;
        console.log('Communicator initialized');
    }

    /**
     * Send a request to the backend and await the response.
     */
    public async requestFromNode<T = any>(cmd: RequestName, payload: any = {}): Promise<T> {
        const id = crypto.randomUUID(); // Native browser UUID generation

        const message = {
            id,
            cmd,
            payload,
        };

        return new Promise<T>((resolve, reject) => {
            // 1. Store the resolver
            this.pendingRequests.set(id, { resolve, reject });

            // 2. Send the message string to Rust
            invoke('send_to_sidecar', { message: JSON.stringify(message) })
                .catch((err) => {
                    this.pendingRequests.delete(id);
                    reject(err);
                });
        });
    }

    public listeners: Partial<Record<EventName, CallableFunction[]>> = {};

    public onEvent(type: EventName, cb: EventHandler) {
        if (this.listeners[type]) this.listeners[type].push(cb);
        else this.listeners[type] = [cb];
    }

    private broadcastEvent(type: EventName, data: any) {
        this.listeners[type]?.forEach(element => {
            element(data);
        });
    }
}

export const communicator = new Communicator();