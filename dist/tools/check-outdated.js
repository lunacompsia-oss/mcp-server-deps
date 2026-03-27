/**
 * check_outdated tool: Parse package.json and compare dependency versions
 * against the latest published versions on npm.
 */
import { getLatestVersion } from "../lib/npm-registry.js";
function cleanVersion(version) {
    return version.replace(/^[\^~>=<\s]+/, "").split(" ")[0];
}
function classifyUpdate(current, latest) {
    const cur = current.split(".").map(Number);
    const lat = latest.split(".").map(Number);
    if (cur.length < 3 || lat.length < 3)
        return "unknown";
    if (isNaN(cur[0]) || isNaN(lat[0]))
        return "unknown";
    if (lat[0] > cur[0])
        return "major";
    if (lat[1] > cur[1])
        return "minor";
    if (lat[2] > cur[2])
        return "patch";
    return "patch";
}
export async function checkOutdated(packageJsonContent) {
    let parsed;
    try {
        parsed = JSON.parse(packageJsonContent);
    }
    catch {
        return {
            content: [{ type: "text", text: "Error: Invalid JSON. Could not parse the provided package.json content." }],
        };
    }
    const deps = [];
    const dependencies = parsed.dependencies;
    const devDependencies = parsed.devDependencies;
    if (dependencies) {
        for (const [name, version] of Object.entries(dependencies)) {
            deps.push({ name, current: cleanVersion(version), group: "dependencies" });
        }
    }
    if (devDependencies) {
        for (const [name, version] of Object.entries(devDependencies)) {
            deps.push({ name, current: cleanVersion(version), group: "devDependencies" });
        }
    }
    if (deps.length === 0) {
        return {
            content: [{ type: "text", text: "No dependencies found in the provided package.json." }],
        };
    }
    const results = [];
    // Fetch latest versions concurrently (batched to avoid overwhelming the registry)
    const batchSize = 10;
    for (let i = 0; i < deps.length; i += batchSize) {
        const batch = deps.slice(i, i + batchSize);
        const latestVersions = await Promise.allSettled(batch.map((dep) => getLatestVersion(dep.name)));
        for (let j = 0; j < batch.length; j++) {
            const dep = batch[j];
            const result = latestVersions[j];
            if (result.status === "fulfilled") {
                const latest = result.value;
                if (latest !== dep.current) {
                    results.push({
                        name: dep.name,
                        current: dep.current,
                        latest,
                        type: classifyUpdate(dep.current, latest),
                        group: dep.group,
                    });
                }
            }
            else {
                results.push({
                    name: dep.name,
                    current: dep.current,
                    latest: "unknown",
                    type: "unknown",
                    group: dep.group,
                    error: result.reason instanceof Error ? result.reason.message : "Failed to fetch",
                });
            }
        }
    }
    if (results.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: `All ${deps.length} dependencies are up to date.`,
                },
            ],
        };
    }
    const majors = results.filter((r) => r.type === "major");
    const minors = results.filter((r) => r.type === "minor");
    const patches = results.filter((r) => r.type === "patch");
    const unknowns = results.filter((r) => r.type === "unknown");
    let output = `# Outdated Dependencies\n\n`;
    output += `Found ${results.length} outdated out of ${deps.length} total dependencies.\n\n`;
    const formatSection = (title, items) => {
        if (items.length === 0)
            return "";
        let section = `## ${title} (${items.length})\n\n`;
        for (const item of items) {
            section += `- **${item.name}**: ${item.current} -> ${item.latest} (${item.group})`;
            if (item.error)
                section += ` [error: ${item.error}]`;
            section += "\n";
        }
        section += "\n";
        return section;
    };
    output += formatSection("Major Updates", majors);
    output += formatSection("Minor Updates", minors);
    output += formatSection("Patch Updates", patches);
    output += formatSection("Unknown", unknowns);
    return { content: [{ type: "text", text: output.trim() }] };
}
//# sourceMappingURL=check-outdated.js.map