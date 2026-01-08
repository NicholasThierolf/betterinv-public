import readline from 'node:readline';
import { communicator } from './communicator';

// Interface for incoming requests
interface IncomingMessage {
    id?: string;
    cmd: string;
    payload?: any;
}

// Interface for outgoing responses
interface OutgoingMessage {
    id?: string; // If present, it's a response to a request
    type: 'response' | 'event';
    data: any;
    error?: string;
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false // Important: prevent echo behavior
});

// Helper to send data back to Rust (which forwards to Frontend)
function sendToHost(message: OutgoingMessage) {
    console.log(JSON.stringify(message));
}

communicator.init(sendToHost);

rl.on('line', async (line) => {
    try {
        if (!line.trim()) return;

        const msg: IncomingMessage = JSON.parse(line);

        // Handle the command
        try {
            const result = await handleCommand(msg.cmd, msg.payload);

            // If it has an ID, the frontend is waiting for this specific response
            if (msg.id) {
                sendToHost({
                    id: msg.id,
                    type: 'response',
                    data: result
                });
            }
        } catch (err: any) {
            if (msg.id) {
                sendToHost({
                    id: msg.id,
                    type: 'response',
                    data: null,
                    error: err.message || 'Unknown error'
                });
            }
        }
    } catch (e) {
        // If JSON parse fails, we can log it to stderr (Tauri logs this too)
        console.error('Failed to parse incoming line:', line);
    }
});


async function handleCommand(cmd: string, payload: any) {
    return await communicator.handleRequestFromFrontend(cmd, payload);
}

setInterval(() => {
    sendToHost({
        type: 'event',
        data: { status: 'heartbeat', active: true }
    });
}, 10000);