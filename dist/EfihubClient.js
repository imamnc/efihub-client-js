"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EfihubClient = void 0;
const axios_1 = __importDefault(require("axios"));
class EfihubClient {
    constructor(config) {
        this.accessToken = null;
        this.tokenExpiry = null;
        this.config = config;
        this.http = axios_1.default.create({
            baseURL: this.config.apiBaseUrl,
            timeout: 10000,
        });
    }
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }
        const response = await axios_1.default.post(this.config.tokenUrl, {
            grant_type: "client_credentials",
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
        });
        this.accessToken = response.data.access_token;
        this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
        return this.accessToken;
    }
    async request(method, url, data, options) {
        const token = await this.getAccessToken();
        try {
            return await this.http.request({
                method,
                url,
                data,
                headers: { Authorization: `Bearer ${token}` },
                ...options,
            });
        }
        catch (error) {
            if (error.response?.status === 401) {
                this.accessToken = null;
                const newToken = await this.getAccessToken();
                return await this.http.request({
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
    get(url, options) {
        return this.request("GET", url, undefined, options);
    }
    post(url, data, options) {
        return this.request("POST", url, data, options);
    }
    put(url, data, options) {
        return this.request("PUT", url, data, options);
    }
    delete(url, options) {
        return this.request("DELETE", url, undefined, options);
    }
}
exports.EfihubClient = EfihubClient;
