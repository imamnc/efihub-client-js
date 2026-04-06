"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageClient = void 0;
const form_data_1 = __importDefault(require("form-data"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
class StorageClient {
    constructor(base) {
        this.base = base;
    }
    /**
     * Upload a file to EFIHUB storage.
     * - input: string file path | Buffer | Readable stream
     * - destPath: destination folder or full path; end with '/' to let the server auto-generate the filename
     * Returns the public URL string, or false on failure.
     */
    async upload(input, destPath, filename) {
        const form = new form_data_1.default();
        form.append("path", destPath);
        if (typeof input === "string") {
            const filePath = input;
            const stream = node_fs_1.default.createReadStream(filePath);
            const name = filename ?? node_path_1.default.basename(filePath);
            form.append("file", stream, name);
        }
        else if (Buffer.isBuffer(input)) {
            const name = filename ?? "upload.bin";
            form.append("file", input, name);
        }
        else {
            // Readable stream
            const name = filename ?? "upload.bin";
            form.append("file", input, name);
        }
        try {
            const headers = form.getHeaders();
            const resp = await this.base.post("/storage/upload", form, { headers });
            const uploadedPath = resp.data?.data?.path ?? resp.data?.path;
            if (!uploadedPath)
                return false;
            const urlResp = await this.url(uploadedPath);
            return urlResp.data?.data?.url ?? urlResp.data?.url ?? false;
        }
        catch {
            return false;
        }
    }
    /** Get a public URL for a stored path */
    url(filePath) {
        return this.base.get("/storage/url", { params: { path: filePath } });
    }
    /** Check whether a file exists at the given path. Returns true/false. */
    async exists(filePath) {
        try {
            const resp = await this.base.get("/storage/exists", { params: { path: filePath } });
            return resp.data?.data?.exists ?? resp.data?.exists ?? false;
        }
        catch {
            return false;
        }
    }
    /** Get file size in bytes, or null on failure. */
    async size(filePath) {
        try {
            const resp = await this.base.get("/storage/size", { params: { path: filePath } });
            return resp.data?.data?.size ?? resp.data?.size ?? null;
        }
        catch {
            return null;
        }
    }
    /** Delete a file at the given path. Returns true on success. */
    async delete(filePath) {
        try {
            const resp = await this.base.delete("/storage/delete", { data: { path: filePath } });
            return resp.data?.data?.deleted ?? resp.data?.deleted ?? (resp.status >= 200 && resp.status < 300);
        }
        catch {
            return false;
        }
    }
}
exports.StorageClient = StorageClient;
