export const API_URLS = {
  user: import.meta.env.VITE_USER_API_URL || "http://127.0.0.1:5000",
  grievance: import.meta.env.VITE_GRIEVANCE_API_URL || "http://127.0.0.1:5001",
  admin: import.meta.env.VITE_ADMIN_API_URL || "http://127.0.0.1:5002",
};

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
