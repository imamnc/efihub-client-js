import { EfihubClient } from "../EfihubClient";
export declare class SSOClient {
    private base;
    constructor(base: EfihubClient);
    /**
     * Generate the EFIHUB SSO authorization URL.
     * Redirect the user to this URL to log in via EFIHUB.
     * Returns the authorization URL string, or false on failure.
     */
    login(): Promise<string | false>;
    /**
     * Exchange the redirect_token (received in callback query params) for user profile data.
     * Returns a user data object, or false on failure.
     */
    userData(redirectToken: string): Promise<Record<string, any> | false>;
}
