"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketClient = void 0;
class SocketClient {
    constructor(base) {
        this.base = base;
    }
    /** Dispatch real-time event to a channel */
    async dispatch(payload) {
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
