import axios from 'axios';
import env from '../config/env';
import { supabase } from './supabaseClient';

/**
 * Centralized API client.
 *
 *   - Single axios instance: all requests share baseURL, timeout, headers
 *   - Request interceptor: attaches the Supabase access token when present
 *     (server routes that require auth read it from Authorization: Bearer …)
 *   - Response interceptor: normalizes errors into { message, status, code }
 *
 * Guest flows work without a token; protected flows fail gracefully when
 * the session is missing.
 */
export const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch {
    // Anonymous request — proceed without a token
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = {
      message:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Something went wrong. Please try again.',
      status: error.response?.status || 0,
      code: error.code || 'UNKNOWN',
      data: error.response?.data,
    };

    // Surface network failures explicitly so the UI can show the right copy
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        normalized.message = 'The request timed out. Please try again.';
        normalized.code = 'TIMEOUT';
      } else if (!navigator.onLine) {
        normalized.message = 'No network connection. Check your internet and try again.';
        normalized.code = 'OFFLINE';
      } else {
        normalized.message = 'Could not reach the server. Please try again shortly.';
        normalized.code = 'NETWORK_ERROR';
      }
    }

    return Promise.reject(normalized);
  }
);

export default api;