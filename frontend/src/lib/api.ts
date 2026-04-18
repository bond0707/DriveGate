import axios from 'axios';

export const axiosInstance = axios;

// Use local Next.js API proxy (adds X-API-Key server-side)
// Requests to /api/* are forwarded to NEXT_PUBLIC_API_URL with the secret key
const API_URL = '/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            // Only add token if not already explicitly set in request config
            if (token && !config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401s
// Only redirect on 401 if the request was using the user's main JWT token
// Do NOT redirect for:
// - Public endpoints (TOTP verification, slug validation)
// - Upload token auth (get-upload-link uses uploadToken, not user token)

// Public endpoints that return 401 for validation failures, not auth failures
const PUBLIC_ENDPOINTS = ['/totp/verify', '/url/slug/validate'];

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Skip redirect for public endpoints
            const requestUrl = error.config?.url || '';
            const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => requestUrl.includes(endpoint));

            if (isPublicEndpoint) {
                return Promise.reject(error);
            }

            // Check if this request was using the user's stored token
            const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const requestAuth = error.config?.headers?.Authorization;

            // Only redirect if:
            // 1. There was a stored token
            // 2. That token was used in this request (Bearer matches)
            // This prevents redirects for uploadToken auth or public endpoints
            if (storedToken && requestAuth === `Bearer ${storedToken}`) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
            }
        }
        return Promise.reject(error);
    }
);
