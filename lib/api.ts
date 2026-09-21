import axios from "axios";
import { getToken, removeToken } from "./auth";

export const api = axios.create({
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Do NOT redirect globally on 401 — individual components handle errors gracefully.
// Auth verification is done on dashboard mount via AuthProvider.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

/** Call this to hard-logout and go back to login. */
export function forceLogout() {
  removeToken();
  window.location.href = "/login";
}

/** Verifies the stored token against the backend. Returns true if valid. */
export async function verifyAuth(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await fetch("/api/auth", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
