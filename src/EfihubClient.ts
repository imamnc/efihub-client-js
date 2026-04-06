import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import FormData from "form-data";
import fs from "node:fs";
import path from "node:path";
import { EfihubClientConfig } from "./types";
import { StorageClient } from "./modules/StorageClient";
import { SocketClient } from "./modules/SocketClient";
import { SSOClient } from "./modules/SSOClient";
import { WhatsappClient } from "./modules/WhatsappClient";

export class EfihubClient {
  private config: Required<EfihubClientConfig>;
  private http: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private _storage?: StorageClient;
  private _socket?: SocketClient;
  private _sso?: SSOClient;
  private _whatsapp?: WhatsappClient;

  constructor(config: EfihubClientConfig) {
    const defaultTokenUrl = "https://efihub.morefurniture.id/oauth/token";
    const defaultApiBaseUrl = "https://efihub.morefurniture.id/api";
    this.config = {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      tokenUrl: config.tokenUrl ?? defaultTokenUrl,
      apiBaseUrl: config.apiBaseUrl ?? defaultApiBaseUrl,
    };
    this.http = axios.create({
      baseURL: this.config.apiBaseUrl,
      timeout: 10000,
    });
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await axios.post(this.config.tokenUrl, {
      grant_type: "client_credentials",
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

    return this.accessToken!;
  }

  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const token = await this.getAccessToken();

    try {
      return await this.http.request<T>({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` },
        ...options,
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.accessToken = null;
        const newToken = await this.getAccessToken();
        return await this.http.request<T>({
          method,
          url,
          data,
          headers: { Authorization: `Bearer ${newToken}` },
          ...options,
        });
      }
      throw error;
    }
  }

  public get<T = any>(url: string, options?: AxiosRequestConfig) {
    return this.request<T>("GET", url, undefined, options);
  }

  public post<T = any>(url: string, data: any, options?: AxiosRequestConfig) {
    return this.request<T>("POST", url, data, options);
  }

  public put<T = any>(url: string, data: any, options?: AxiosRequestConfig) {
    return this.request<T>("PUT", url, data, options);
  }

  public delete<T = any>(url: string, options?: AxiosRequestConfig) {
    return this.request<T>("DELETE", url, undefined, options);
  }

  /**
   * POST multipart/form-data with optional file attachments.
   * - fields: plain key-value pairs appended as form fields
   * - files: map of field name to local file path
   */
  public async postMultipart<T = any>(
    url: string,
    fields: Record<string, string | number | boolean> = {},
    files: Record<string, string> = {},
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      form.append(key, String(value));
    }
    for (const [field, filePath] of Object.entries(files)) {
      form.append(
        field,
        fs.createReadStream(filePath),
        path.basename(filePath),
      );
    }
    return this.request<T>("POST", url, form, {
      headers: form.getHeaders(),
      ...options,
    });
  }

  /** Storage module: helpers to upload and manage files */
  public storage(): StorageClient {
    if (!this._storage) this._storage = new StorageClient(this);
    return this._storage;
  }

  /** Websocket module: dispatch events to channels */
  public socket(): SocketClient {
    if (!this._socket) this._socket = new SocketClient(this);
    return this._socket;
  }

  /** SSO module: generate authorization URL and fetch user profile */
  public sso(): SSOClient {
    if (!this._sso) this._sso = new SSOClient(this);
    return this._sso;
  }

  /** WhatsApp module: manage agents and send messages */
  public whatsapp(): WhatsappClient {
    if (!this._whatsapp) this._whatsapp = new WhatsappClient(this);
    return this._whatsapp;
  }
}
