/**
 * npm registry API helpers.
 * Fetches package metadata, versions, and download stats.
 */

import { fetchJSON, fetchJSONSafe } from "./fetcher.js";

const NPM_REGISTRY = "https://registry.npmjs.org";
const NPM_DOWNLOADS = "https://api.npmjs.org/downloads/point/last-week";

export interface NpmPackageLatest {
  name: string;
  version: string;
  description?: string;
  dependencies?: Record<string, string>;
}

export interface NpmPackageFull {
  name: string;
  "dist-tags": Record<string, string>;
  time: Record<string, string>;
  maintainers: Array<{ name: string; email?: string }>;
  repository?: { type?: string; url?: string };
  description?: string;
  license?: string;
  versions: Record<string, NpmPackageLatest>;
}

export interface NpmDownloads {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

export async function getLatestVersion(packageName: string): Promise<string> {
  const data = await fetchJSON<NpmPackageLatest>(`${NPM_REGISTRY}/${encodeURIComponent(packageName)}/latest`);
  return data.version;
}

export async function getPackageVersion(packageName: string, version: string): Promise<NpmPackageLatest> {
  return fetchJSON<NpmPackageLatest>(`${NPM_REGISTRY}/${encodeURIComponent(packageName)}/${version}`);
}

export async function getPackageFull(packageName: string): Promise<NpmPackageFull> {
  return fetchJSON<NpmPackageFull>(`${NPM_REGISTRY}/${encodeURIComponent(packageName)}`);
}

export async function getWeeklyDownloads(packageName: string): Promise<number | null> {
  const data = await fetchJSONSafe<NpmDownloads>(`${NPM_DOWNLOADS}/${encodeURIComponent(packageName)}`);
  return data?.downloads ?? null;
}

export async function getPackageDependencies(
  packageName: string,
  version?: string
): Promise<Record<string, string>> {
  const ver = version ?? "latest";
  const data = await fetchJSON<NpmPackageLatest>(`${NPM_REGISTRY}/${encodeURIComponent(packageName)}/${ver}`);
  return data.dependencies ?? {};
}
