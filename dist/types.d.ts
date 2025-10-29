export interface EfihubClientConfig {
    clientId: string;
    clientSecret: string;
    tokenUrl?: string;
    apiBaseUrl?: string;
}
import type { Readable } from "node:stream";
export type StorageUploadInput = string | Buffer | Readable;
