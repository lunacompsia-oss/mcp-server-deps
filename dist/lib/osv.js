/**
 * OSV.dev API helpers for vulnerability data.
 * OSV is free, open, and covers multiple ecosystems.
 */
import { fetchJSON } from "./fetcher.js";
const OSV_API = "https://api.osv.dev/v1/query";
export async function queryVulnerabilities(packageName, ecosystem, version) {
    const body = {
        package: {
            name: packageName,
            ecosystem,
        },
    };
    if (version) {
        body.version = version;
    }
    const data = await fetchJSON(OSV_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return data.vulns ?? [];
}
//# sourceMappingURL=osv.js.map