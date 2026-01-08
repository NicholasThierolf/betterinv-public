import { communicator } from "./communicator";

let storedLogs = [];

export function log(string: string) {
    storedLogs.push(string);
    communicator.eventToSvelte("log", string)
}

export function sendStoredLogs() {
    storedLogs.forEach(log => communicator.eventToSvelte("log", log));
    // storedLogs = [];
}