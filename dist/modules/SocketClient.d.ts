import { EfihubClient } from "../EfihubClient";
export interface DispatchPayload<T = any> {
    channel: string;
    event: string;
    data?: T;
}
export declare class SocketClient {
    private base;
    constructor(base: EfihubClient);
    /** Dispatch real-time event to a channel */
    dispatch<T = any>(payload: DispatchPayload<T>): Promise<boolean>;
}
