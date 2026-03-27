/**
 * HTTP fetch wrapper with error handling, timeout, and User-Agent.
 * Uses native fetch (Node 18+). All requests have a 10-second timeout.
 */

const USER_AGENT = "mcp-server-deps/0.1.0";
const TIMEOUT_MS = 10_000;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface FetchOptions {
  headers?: Record<string, string>;
  method?: string;
  body?: string;
}

function createAbortSignal(): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), TIMEOUT_MS);
  return controller.signal;
}

export async function fetchJSON<T>(url: string, options?: FetchOptions): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": USER_AGENT,
    ...options?.headers,
  };

  if (url.includes("api.github.com") && GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  const response = await fetch(url, {
    method: options?.method ?? "GET",
    headers,
    body: options?.body,
    signal: createAbortSignal(),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}: ${response.statusText} for ${url}${text ? ` - ${text.slice(0, 200)}` : ""}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchJSONSafe<T>(url: string, options?: FetchOptions): Promise<T | null> {
  try {
    return await fetchJSON<T>(url, options);
  } catch {
    return null;
  }
}
