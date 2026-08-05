export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080";

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function authHeaders(token, extraHeaders = {}) {
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function authFetch(url, token, options = {}) {
  const headers = authHeaders(token, options.headers || {});
  return fetch(url, { ...options, headers });
}
