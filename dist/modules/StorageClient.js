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
     * - destPath: folder or full path; if ends with '/', server may generate filename
     */
    async upload(destPath, input, filename) {
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
        const headers = form.getHeaders();
        const resp = await this.base.post("/storage/upload", form, { headers });
        const uploadedPath = resp.data?.data?.path ?? resp.data?.path;
        if (!uploadedPath)
            return null;
        const urlResp = await this.url(uploadedPath);
        return urlResp.data?.url ?? null;
    }
    /** Get a public URL for a stored path */
    url(filePath) {
        return this.base.get("/storage/url", { params: { path: filePath } });
    }
    /** Check if a path exists */
    exists(filePath) {
        return this.base.get("/storage/exists", { params: { path: filePath } });
    }
    /** Get size in bytes for a path */
    size(filePath) {
        return this.base.get("/storage/size", { params: { path: filePath } });
    }
    /** Delete a path */
    delete(filePath) {
        return this.base.delete("/storage/delete", { data: { path: filePath } });
    }
}
exports.StorageClient = StorageClient;
