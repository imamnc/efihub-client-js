import { EfihubClient } from "../EfihubClient";

export class SSOClient {
  constructor(private base: EfihubClient) {}

  /**
   * Generate the EFIHUB SSO authorization URL.
   * Redirect the user to this URL to log in via EFIHUB.
   * Returns the authorization URL string, or false on failure.
   */
  async login(): Promise<string | false> {
    try {
      const resp = await this.base.post("/sso/authorize", {});
      const url = resp.data?.data?.url ?? resp.data?.url;
      return typeof url === "string" ? url : false;
    } catch {
      return false;
    }
  }

  /**
   * Exchange the redirect_token (received in callback query params) for user profile data.
   * Returns a user data object, or false on failure.
   */
  async userData(redirectToken: string): Promise<Record<string, any> | false> {
    try {
      const resp = await this.base.get("/sso/user", {
        params: { redirect_token: redirectToken },
      });
      const user = resp.data?.data ?? resp.data;
      return user && typeof user === "object" ? user : false;
    } catch {
      return false;
    }
  }
}
