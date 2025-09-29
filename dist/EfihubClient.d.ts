import { AxiosRequestConfig, AxiosResponse } from "axios";
import { EfihubClientConfig } from "./types";
export declare class EfihubClient {
    private config;
    private http;
    private accessToken;
    private tokenExpiry;
    constructor(config: EfihubClientConfig);
    private getAccessToken;
    private request;
    get<T = any>(url: string, options?: AxiosRequestConfig): Promise<AxiosResponse<T, any, {}>>;
    post<T = any>(url: string, data: any, options?: AxiosRequestConfig): Promise<AxiosResponse<T, any, {}>>;
    put<T = any>(url: string, data: any, options?: AxiosRequestConfig): Promise<AxiosResponse<T, any, {}>>;
    delete<T = any>(url: string, options?: AxiosRequestConfig): Promise<AxiosResponse<T, any, {}>>;
}
