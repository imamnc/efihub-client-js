import { EfihubClient } from "../EfihubClient";
export interface DispatchPayload<T = any> {
    channel: string;
    event: string;
    data?: T;
}
export declare class SocketClient {
    private base;
    constructor(base: EfihubClient);
    /**
     * Dispatch a real-time event to a channel.
     *
     * Supports two call styles:
     *   dispatch(channel, event, data?)           — flat args (Laravel-compatible)
     *   dispatch({ channel, event, data? })        — object payload
     *
     * Returns true on HTTP success (2xx), false otherwise.
     */
    dispatch<T = any>(channelOrPayload: string | DispatchPayload<T>, event?: string, data?: T): Promise<boolean>;
}
