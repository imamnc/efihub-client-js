import type { AxiosResponse } from "axios";
import { EfihubClient } from "../EfihubClient";
import type { StorageUploadInput } from "../types";
export declare class StorageClient {
    private base;
    constructor(base: EfihubClient);
    /**
     * Upload a file to EFIHUB storage.
     * - input: string file path | Buffer | Readable stream
     * - destPath: folder or full path; if ends with '/', server may generate filename
     */
    upload(destPath: string, input: StorageUploadInput, filename?: string): Promise<string | null>;
    /** Get a public URL for a stored path */
    url(filePath: string): Promise<AxiosResponse<{
        url: string;
    }>>;
    /** Check if a path exists */
    exists(filePath: string): Promise<AxiosResponse<{
        exists: boolean;
    }>>;
    /** Get size in bytes for a path */
    size(filePath: string): Promise<AxiosResponse<{
        size: number | null;
    }>>;
    /** Delete a path */
    delete(filePath: string): Promise<AxiosResponse<{
        deleted: boolean;
    }>>;
}
