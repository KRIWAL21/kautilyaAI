import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

// === BASE CONFIG ===
// Point to chanakya-astra-service (user = broker, company = builder, super-admin = super admin)
const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3333";
export const BASE_URL = rawBaseUrl.replace(/\/+$/, "");
axios.defaults.baseURL = BASE_URL;

// === TOKEN MANAGEMENT ===
// Keys must match AuthStore.ts exactly — one source of truth
const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "userId";

/**
 * Token storage utilities
 */
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUserId: (): string | null => {
    return localStorage.getItem(USER_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  setUserData: (userData: any): void => {
    localStorage.setItem(USER_KEY, userData);
  },

  getUserData: (): any | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearAll: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// === REFRESH TOKEN LOGIC ===
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Refresh the access token using refresh token
 */
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    // Broker (user) refresh: POST /users/auth/refresh-token
    const response = await axios.post(`${BASE_URL}/users/auth/refresh-token`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    tokenStorage.setTokens(accessToken, newRefreshToken);

    return accessToken;
  } catch (error) {
    // If refresh fails, clear ALL tokens and redirect to login cleanly
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    throw error;
  }
};

// === AXIOS INTERCEPTORS ===

/**
 * Request Interceptor - Attach Bearer token (skip for refresh-token to avoid sending expired token)
 */
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.url?.includes("refresh-token")) return config;
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response Interceptor - Handle responses, errors, and token refresh
 */
axios.interceptors.response.use(
  (response) => {
    // const toastStore = useToastStore();

    // Show success toast for non-GET requests
    if (
      response.config.method !== "get" &&
      response.status >= 200 &&
      response.status < 300 &&
      response.data?.message
    ) {
    }

    return response;
  },
  async (error: AxiosError<any>) => {
    // const toastStore = useToastStore();
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        processQueue(null, newAccessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear all keys and do a soft redirect (no flicker)
        localStorage.clear();
        window.location.replace("/auth/login");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Make a request to the API with Authentication
 *
 * @param {string} endpoint - Base endpoint (e.g. 'userleave')
 * @param {string} method - HTTP method (e.g. 'GET', 'POST')
 * @param {Object} data - Request body
 * @param {Object} config - Axios config overrides
 * @param {Object} params - URL query parameters
 * @param {number} [wait=0] - Optional delay in milliseconds
 * @param {string|number} [id=null] - Optional request ID
 * @param {string} [subPath=''] - Optional sub-route (e.g. '/admin')
 * @returns {Promise<any>}
 */
export async function makeRequest(
  endpoint: string,
  method = "GET",
  data = {},
  config = {},
  params = {},
  wait = 0,
  id: string | number | null = null,
  subPath = ""
) {
  try {
    if (!endpoint) throw new Error("Endpoint is required");

    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    // Build final endpoint path (subPath before id)
    let fullEndpoint = endpoint;
    if (subPath) fullEndpoint += `${subPath}`;
    if (id !== null && id !== undefined) fullEndpoint += `/${id}`;

    const response = await axios({
      url: fullEndpoint,
      method: method.toUpperCase(),
      data,
      params,
      ...config,
    });

    return response.data;
  } catch (error) {
    console.error(`[Request Failed${id ? ` - ${id}` : ""}]`, error);
    throw error;
  }
}

/**
 * Login helper function
 * Stores tokens and user data after successful login
 */
/** Broker login: POST /users/auth/login (phoneNumber + password) */
export async function login(phoneNumber: string, password: string) {
  try {
    const response = await axios.post(`${BASE_URL}/users/auth/login`, {
      phoneNumber,
      password,
    });

    const { accessToken, refreshToken, user } = response.data.data;
    const userId = user?._id ?? response.data.data._id;

    tokenStorage.setTokens(accessToken, refreshToken);
    tokenStorage.setUserData(userId);

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Logout helper function
 * Clears all stored tokens and user data
 */
export async function logout() {
  try {
    // Optionally call logout endpoint
    // await makeRequest("/auth/logout", "POST");
     tokenStorage.clearAll();
     window.location.href = '/auth/login';
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Always clear local storage
    tokenStorage.clearAll();
    
    // Optionally redirect to login
    // window.location.href = '/login';
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!tokenStorage.getAccessToken();
}
