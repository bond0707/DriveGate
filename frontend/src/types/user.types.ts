/**
 * Core User type returned by /auth/me endpoint.
 * Shared across AuthContext, Dashboard, Setup pages.
 */
export interface User {
    id: number;
    username: string;
    email: string;
    picture_url?: string | null;
    totp_secret?: string | null;
    folder_id?: string | null;
    folder_name?: string | null;
    url_slug?: string | null;
}
