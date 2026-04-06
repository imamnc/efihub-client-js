"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSOClient = void 0;
class SSOClient {
    constructor(base) {
        this.base = base;
    }
    /**
     * Generate the EFIHUB SSO authorization URL.
     * Redirect the user to this URL to log in via EFIHUB.
     * Returns the authorization URL string, or false on failure.
     */
    async login() {
        try {
            const resp = await this.base.post("/sso/authorize", {});
            const url = resp.data?.data?.url ?? resp.data?.url;
            return typeof url === "string" ? url : false;
        }
        catch {
            return false;
        }
    }
    /**
     * Exchange the redirect_token (received in callback query params) for user profile data.
     * Returns a user data object, or false on failure.
     */
    async userData(redirectToken) {
        try {
            const resp = await this.base.get("/sso/user", {
                params: { redirect_token: redirectToken },
            });
            const user = resp.data?.data ?? resp.data;
            return user && typeof user === "object" ? user : false;
        }
        catch {
            return false;
        }
    }
}
exports.SSOClient = SSOClient;
