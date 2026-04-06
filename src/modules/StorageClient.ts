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
   * - destPath: destination folder or full path; end with '/' to let the server auto-generate the filename
   * Returns the public URL string, or false on failure.
   */
  async upload(
    input: StorageUploadInput,
    destPath: string,
    filename?: string,
  ): Promise<string | false> {
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

    try {
      const headers = form.getHeaders();
      const resp = await this.base.post("/storage/upload", form, { headers });
      const uploadedPath = resp.data?.data?.path ?? resp.data?.path;
      if (!uploadedPath) return false;
      const urlResp = await this.url(uploadedPath);
      return urlResp.data?.data?.url ?? urlResp.data?.url ?? false;
    } catch {
      return false;
    }
  }

  /** Get a public URL for a stored path */
  url(filePath: string): Promise<AxiosResponse<any>> {
    return this.base.get("/storage/url", { params: { path: filePath } });
  }

  /** Check whether a file exists at the given path. Returns true/false. */
  async exists(filePath: string): Promise<boolean> {
    try {
      const resp = await this.base.get("/storage/exists", {
        params: { path: filePath },
      });
      return resp.data?.data?.exists ?? resp.data?.exists ?? false;
    } catch {
      return false;
    }
  }

  /** Get file size in bytes, or null on failure. */
  async size(filePath: string): Promise<number | null> {
    try {
      const resp = await this.base.get("/storage/size", {
        params: { path: filePath },
      });
      return resp.data?.data?.size ?? resp.data?.size ?? null;
    } catch {
      return null;
    }
  }

  /** Delete a file at the given path. Returns true on success. */
  async delete(filePath: string): Promise<boolean> {
    try {
      const resp = await this.base.delete("/storage/delete", {
        data: { path: filePath },
      });
      return (
        resp.data?.data?.deleted ??
        resp.data?.deleted ??
        (resp.status >= 200 && resp.status < 300)
      );
    } catch {
      return false;
    }
  }
}
