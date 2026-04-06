import { EfihubClient } from "../EfihubClient";

export interface DispatchPayload<T = any> {
  channel: string;
  event: string;
  data?: T;
}

export class SocketClient {
  constructor(private base: EfihubClient) {}

  /**
   * Dispatch a real-time event to a channel.
   *
   * Supports two call styles:
   *   dispatch(channel, event, data?)           — flat args (Laravel-compatible)
   *   dispatch({ channel, event, data? })        — object payload
   *
   * Returns true on HTTP success (2xx), false otherwise.
   */
  async dispatch<T = any>(
    channelOrPayload: string | DispatchPayload<T>,
    event?: string,
    data?: T,
  ): Promise<boolean> {
    const payload: DispatchPayload<T> =
      typeof channelOrPayload === "string"
        ? { channel: channelOrPayload, event: event!, data }
        : channelOrPayload;
    try {
      const resp = await this.base.post("/websocket/dispatch", payload);
      return resp.status >= 200 && resp.status < 300;
    } catch {
      return false;
    }
  }
}
