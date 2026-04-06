"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketClient = void 0;
class SocketClient {
    constructor(base) {
        this.base = base;
    }
    /**
     * Dispatch a real-time event to a channel.
     *
     * Supports two call styles:
     *   dispatch(channel, event, data?)           — flat args (Laravel-compatible)
     *   dispatch({ channel, event, data? })        — object payload
     *
     * Returns true on HTTP success (2xx), false otherwise.
     */
    async dispatch(channelOrPayload, event, data) {
        const payload = typeof channelOrPayload === "string"
            ? { channel: channelOrPayload, event: event, data }
            : channelOrPayload;
        try {
            const resp = await this.base.post("/websocket/dispatch", payload);
            return resp.status >= 200 && resp.status < 300;
        }
        catch {
            return false;
        }
    }
}
exports.SocketClient = SocketClient;
