import { AxiosRequestConfig, AxiosResponse } from "axios";
import { EfihubClientConfig } from "./types";
import { StorageClient } from "./modules/StorageClient";
import { SocketClient } from "./modules/SocketClient";
export declare class EfihubClient {
    private config;
    private http;
    private accessToken;
    private tokenExpiry;
    private _storage?;
    private _socket?;
    constructor(config: EfihubClientConfig);
    private getAccessToken;
    private request;
    get<T = any>(url: string, options?: AxiosRequestConfig): Promise<AxiosResponse<T, any, {}>>;
    post<T = any>(url: string, data: any, options?: AxiosRequestConfig): Promise<AxiosResponse<T, any, {}>>;
    put<T = any>(url: string, data: any, options?: AxiosRequestConfig): Promise<AxiosResponse<T, any, {}>>;
    delete<T = any>(url: string, options?: AxiosRequestConfig): Promise<AxiosResponse<T, any, {}>>;
    /** Storage module: helpers to upload and manage files */
    storage(): StorageClient;
    /** Websocket module: dispatch events to channels */
    socket(): SocketClient;
}
