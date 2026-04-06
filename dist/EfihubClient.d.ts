import { AxiosRequestConfig, AxiosResponse } from "axios";
import { EfihubClientConfig } from "./types";
import { StorageClient } from "./modules/StorageClient";
import { SocketClient } from "./modules/SocketClient";
import { SSOClient } from "./modules/SSOClient";
import { WhatsappClient } from "./modules/WhatsappClient";
export declare class EfihubClient {
    private config;
    private http;
    private accessToken;
    private tokenExpiry;
    private _storage?;
    private _socket?;
    private _sso?;
    private _whatsapp?;
    constructor(config: EfihubClientConfig);
    private getAccessToken;
    private request;
    get<T = any>(url: string, options?: AxiosRequestConfig): Promise<AxiosResponse<T, any, {}>>;
    post<T = any>(url: string, data: any, options?: AxiosRequestConfig): Promise<AxiosResponse<T, any, {}>>;
    put<T = any>(url: string, data: any, options?: AxiosRequestConfig): Promise<AxiosResponse<T, any, {}>>;
    delete<T = any>(url: string, options?: AxiosRequestConfig): Promise<AxiosResponse<T, any, {}>>;
    /**
     * POST multipart/form-data with optional file attachments.
     * - fields: plain key-value pairs appended as form fields
     * - files: map of field name to local file path
     */
    postMultipart<T = any>(url: string, fields?: Record<string, string | number | boolean>, files?: Record<string, string>, options?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    /** Storage module: helpers to upload and manage files */
    storage(): StorageClient;
    /** Websocket module: dispatch events to channels */
    socket(): SocketClient;
    /** SSO module: generate authorization URL and fetch user profile */
    sso(): SSOClient;
    /** WhatsApp module: manage agents and send messages */
    whatsapp(): WhatsappClient;
}
