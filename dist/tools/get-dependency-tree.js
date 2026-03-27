/**
 * get_dependency_tree tool: Recursively resolve the dependency tree
 * for a specific npm package up to a given depth.
 */
import { getPackageDependencies } from "../lib/npm-registry.js";
async function buildTree(packageName, version, depth, maxDepth, visited) {
    const key = `${packageName}@${version}`;
    const node = { name: packageName, version, dependencies: [] };
    if (depth >= maxDepth)
        return node;
    if (visited.has(key)) {
        node.error = "circular";
        return node;
    }
    visited.add(key);
    let deps;
    try {
        deps = await getPackageDependencies(packageName, version);
    }
    catch (err) {
        node.error = err instanceof Error ? err.message : "Failed to fetch";
        return node;
    }
    const entries = Object.entries(deps);
    // Limit concurrent fetches to avoid hammering the registry
    const batchSize = 8;
    for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        const children = await Promise.all(batch.map(([name, ver]) => {
            const cleanVer = ver.replace(/^[\^~>=<\s]+/, "").split(" ")[0];
            return buildTree(name, cleanVer, depth + 1, maxDepth, visited);
        }));
        node.dependencies.push(...children);
    }
    return node;
}
function formatTree(node, prefix = "", isLast = true) {
    const connector = prefix === "" ? "" : isLast ? "`-- " : "|-- ";
    let line = `${prefix}${connector}${node.name}@${node.version}`;
    if (node.error === "circular")
        line += " (circular)";
    else if (node.error)
        line += ` (error: ${node.error})`;
    line += "\n";
    const childPrefix = prefix === "" ? "" : prefix + (isLast ? "    " : "|   ");
    for (let i = 0; i < node.dependencies.length; i++) {
        const child = node.dependencies[i];
        const childIsLast = i === node.dependencies.length - 1;
        line += formatTree(child, childPrefix, childIsLast);
    }
    return line;
}
function countDeps(node) {
    let count = node.dependencies.length;
    for (const child of node.dependencies) {
        count += countDeps(child);
    }
    return count;
}
export async function getDependencyTree(packageName, version, depth = 2) {
    const resolvedVersion = version ?? "latest";
    const maxDepth = Math.min(Math.max(depth, 1), 5);
    const visited = new Set();
    let tree;
    try {
        tree = await buildTree(packageName, resolvedVersion, 0, maxDepth, visited);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
            content: [
                {
                    type: "text",
                    text: `Error building dependency tree for ${packageName}: ${message}`,
                },
            ],
        };
    }
    const totalDeps = countDeps(tree);
    let output = `# Dependency Tree: ${packageName}@${resolvedVersion}\n\n`;
    output += `Depth: ${maxDepth} | Total dependencies resolved: ${totalDeps}\n\n`;
    output += "```\n";
    output += formatTree(tree);
    output += "```\n";
    return { content: [{ type: "text", text: output.trim() }] };
}
//# sourceMappingURL=get-dependency-tree.js.map