import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { EfihubClientConfig } from "./types";

export class EfihubClient {
  private config: EfihubClientConfig;
  private http: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: EfihubClientConfig) {
    this.config = config;
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

  private async request<T = any>(method: string, url: string, data?: any, options?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
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
}