const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Unable to reach the application server. Check that the Spring Boot API is running.');
  }

  if (response.status === 204) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error || body?.message || `Request failed (${response.status}).`);
  }
  return body;
}
