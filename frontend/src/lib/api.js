import axios from 'axios';

const getBaseURL = () => {
    let envBaseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
    if (envBaseURL) {
        // Strip trailing /v1/ or /v1 from the base URL if configured to prevent double v1 in API paths
        if (envBaseURL.endsWith('/v1/')) {
            return envBaseURL.slice(0, -4);
        } else if (envBaseURL.endsWith('/v1')) {
            return envBaseURL.slice(0, -3);
        }
        return envBaseURL;
    }

    // Automatically detect Vercel production hosting and point to production Railway backend
    if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname === 'ai-hms-drab.vercel.app')) {
        return 'https://ai-hms-production.up.railway.app/api';
    }

    return 'http://localhost:8000/api';
};

const envBaseURL = getBaseURL();
const baseURL = envBaseURL.endsWith('/') ? envBaseURL : `${envBaseURL}/`;


export const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let accessToken = null;
let logoutCallback = null;
let refreshCallback = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const injectAuthCallbacks = (logout, refresh) => {
    logoutCallback = logout;
    refreshCallback = refresh;
};

api.interceptors.request.use(
    (config) => {
        const url = config.url || '';
        const isPublicAuthRoute = 
            url.includes('v1/auth/login') ||
            url.includes('v1/auth/register') ||
            url.includes('v1/auth/token/refresh') ||
            url.includes('v1/auth/google') ||
            url.includes('v1/auth/forgot-password') ||
            url.includes('v1/auth/reset-password') ||
            url.includes('v1/auth/verify-otp') ||
            url.includes('v1/auth/check-email') ||
            url.includes('v1/auth/validate-invite');

        if (accessToken && !isPublicAuthRoute) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            const url = originalRequest.url || '';
            // Skip refresh interception on auth operations to prevent loops
            if (
                url.includes('v1/auth/login') ||
                url.includes('v1/auth/register') ||
                url.includes('v1/auth/token/refresh') ||
                url.includes('v1/auth/google') ||
                url.includes('v1/auth/logout')
            ) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            if (refreshCallback) {
                try {
                    const newAccessToken = await refreshCallback();
                    processQueue(null, newAccessToken);
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    if (logoutCallback) {
                        logoutCallback();
                    }
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
        }

        return Promise.reject(error);
    }
);
