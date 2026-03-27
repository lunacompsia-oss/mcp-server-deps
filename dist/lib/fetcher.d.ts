/**
 * HTTP fetch wrapper with error handling, timeout, and User-Agent.
 * Uses native fetch (Node 18+). All requests have a 10-second timeout.
 */
interface FetchOptions {
    headers?: Record<string, string>;
    method?: string;
    body?: string;
}
export declare function fetchJSON<T>(url: string, options?: FetchOptions): Promise<T>;
export declare function fetchJSONSafe<T>(url: string, options?: FetchOptions): Promise<T | null>;
export {};
//# sourceMappingURL=fetcher.d.ts.map