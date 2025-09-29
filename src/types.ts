export interface EfihubClientConfig {
  clientId: string;
  clientSecret: string;
  // Optional: defaults to https://efihub.morefurniture.id/oauth/token
  tokenUrl?: string;
  // Optional: defaults to https://efihub.morefurniture.id/api
  apiBaseUrl?: string;
}