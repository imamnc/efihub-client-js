import type { AxiosResponse } from "axios";
import { EfihubClient } from "../EfihubClient";
import type { StorageUploadInput } from "../types";
export declare class StorageClient {
    private base;
    constructor(base: EfihubClient);
    /**
     * Upload a file to EFIHUB storage.
     * - input: string file path | Buffer | Readable stream
     * - destPath: destination folder or full path; end with '/' to let the server auto-generate the filename
     * Returns the public URL string, or false on failure.
     */
    upload(input: StorageUploadInput, destPath: string, filename?: string): Promise<string | false>;
    /** Get a public URL for a stored path */
    url(filePath: string): Promise<AxiosResponse<any>>;
    /** Check whether a file exists at the given path. Returns true/false. */
    exists(filePath: string): Promise<boolean>;
    /** Get file size in bytes, or null on failure. */
    size(filePath: string): Promise<number | null>;
    /** Delete a file at the given path. Returns true on success. */
    delete(filePath: string): Promise<boolean>;
}
