/**
 * npm registry API helpers.
 * Fetches package metadata, versions, and download stats.
 */
import { fetchJSON, fetchJSONSafe } from "./fetcher.js";
const NPM_REGISTRY = "https://registry.npmjs.org";
const NPM_DOWNLOADS = "https://api.npmjs.org/downloads/point/last-week";
export async function getLatestVersion(packageName) {
    const data = await fetchJSON(`${NPM_REGISTRY}/${encodeURIComponent(packageName)}/latest`);
    return data.version;
}
export async function getPackageVersion(packageName, version) {
    return fetchJSON(`${NPM_REGISTRY}/${encodeURIComponent(packageName)}/${version}`);
}
export async function getPackageFull(packageName) {
    return fetchJSON(`${NPM_REGISTRY}/${encodeURIComponent(packageName)}`);
}
export async function getWeeklyDownloads(packageName) {
    const data = await fetchJSONSafe(`${NPM_DOWNLOADS}/${encodeURIComponent(packageName)}`);
    return data?.downloads ?? null;
}
export async function getPackageDependencies(packageName, version) {
    const ver = version ?? "latest";
    const data = await fetchJSON(`${NPM_REGISTRY}/${encodeURIComponent(packageName)}/${ver}`);
    return data.dependencies ?? {};
}
//# sourceMappingURL=npm-registry.js.map