import type { AxiosResponse } from "axios";
import FormData from "form-data";
import fs from "node:fs";
import path from "node:path";
import type { Readable } from "node:stream";
import { EfihubClient } from "../EfihubClient";
import type { StorageUploadInput } from "../types";

export class StorageClient {
  constructor(private base: EfihubClient) {}

  /**
   * Upload a file to EFIHUB storage.
   * - input: string file path | Buffer | Readable stream
   * - destPath: folder or full path; if ends with '/', server may generate filename
   */
  async upload(
    destPath: string,
    input: StorageUploadInput,
    filename?: string
  ): Promise<string | null> {
    const form = new FormData();
    form.append("path", destPath);

    if (typeof input === "string") {
      const filePath = input;
      const stream = fs.createReadStream(filePath);
      const name = filename ?? path.basename(filePath);
      form.append("file", stream, name);
    } else if (Buffer.isBuffer(input)) {
      const name = filename ?? "upload.bin";
      form.append("file", input, name);
    } else {
      // Readable stream
      const name = filename ?? "upload.bin";
      form.append("file", input as Readable, name);
    }

    const headers = form.getHeaders();
    const resp = await this.base.post("/storage/upload", form, { headers });
    const uploadedPath = resp.data?.data?.path ?? resp.data?.path;
    if (!uploadedPath) return null;
    const urlResp = await this.url(uploadedPath);
    return urlResp.data?.url ?? null;
  }

  /** Get a public URL for a stored path */
  url(filePath: string): Promise<AxiosResponse<{ url: string }>> {
    return this.base.get("/storage/url", { params: { path: filePath } });
  }

  /** Check if a path exists */
  exists(filePath: string): Promise<AxiosResponse<{ exists: boolean }>> {
    return this.base.get("/storage/exists", { params: { path: filePath } });
  }

  /** Get size in bytes for a path */
  size(filePath: string): Promise<AxiosResponse<{ size: number | null }>> {
    return this.base.get("/storage/size", { params: { path: filePath } });
  }

  /** Delete a path */
  delete(filePath: string): Promise<AxiosResponse<{ deleted: boolean }>> {
    return this.base.delete("/storage/delete", { data: { path: filePath } });
  }
}
