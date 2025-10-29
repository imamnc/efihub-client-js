import type { AxiosResponse } from "axios";
import { EfihubClient } from "../EfihubClient";

export interface DispatchPayload<T = any> {
  channel: string;
  event: string;
  data?: T;
}

export class SocketClient {
  constructor(private base: EfihubClient) {}

  /** Dispatch real-time event to a channel */
  async dispatch<T = any>(payload: DispatchPayload<T>): Promise<boolean> {
    try {
      const resp = await this.base.post("/websocket/dispatch", payload);
      return resp.status >= 200 && resp.status < 300;
    } catch {
      return false;
    }
  }
}
