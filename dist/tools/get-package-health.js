/**
 * get_package_health tool: Fetch health and quality metrics for an npm package.
 * Last publish date, weekly downloads, maintainer count, GitHub stars, open issues.
 */
import { getPackageFull, getWeeklyDownloads } from "../lib/npm-registry.js";
import { fetchJSONSafe } from "../lib/fetcher.js";
function extractGitHubRepo(repoUrl) {
    if (!repoUrl)
        return null;
    // Handle various GitHub URL formats
    const match = repoUrl.match(/github\.com[/:]([^/]+\/[^/.]+)/);
    if (!match)
        return null;
    return match[1].replace(/\.git$/, "");
}
function formatTimeSince(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days === 0)
        return "today";
    if (days === 1)
        return "1 day ago";
    if (days < 30)
        return `${days} days ago`;
    if (days < 365) {
        const months = Math.floor(days / 30);
        return `${months} month${months > 1 ? "s" : ""} ago`;
    }
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
}
function formatDownloads(n) {
    if (n >= 1_000_000)
        return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)
        return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}
export async function getPackageHealth(packageName) {
    let output = `# Package Health: ${packageName}\n\n`;
    // Fetch npm metadata and downloads concurrently
    const [fullResult, downloadsResult] = await Promise.allSettled([
        getPackageFull(packageName),
        getWeeklyDownloads(packageName),
    ]);
    if (fullResult.status === "rejected") {
        const message = fullResult.reason instanceof Error ? fullResult.reason.message : String(fullResult.reason);
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching package info for ${packageName}: ${message}`,
                },
            ],
        };
    }
    const pkg = fullResult.value;
    const downloads = downloadsResult.status === "fulfilled" ? downloadsResult.value : null;
    // Basic info
    const latestVersion = pkg["dist-tags"]?.latest ?? "unknown";
    const description = pkg.description ?? "No description";
    const license = pkg.license ?? "Unknown";
    output += `**Description**: ${description}\n`;
    output += `**Latest version**: ${latestVersion}\n`;
    output += `**License**: ${license}\n\n`;
    // Publish timeline
    output += `## Publish History\n\n`;
    const times = pkg.time;
    if (times) {
        const lastPublished = times[latestVersion];
        if (lastPublished) {
            output += `- **Last published**: ${lastPublished.split("T")[0]} (${formatTimeSince(lastPublished)})\n`;
        }
        const created = times.created;
        if (created) {
            output += `- **Created**: ${created.split("T")[0]} (${formatTimeSince(created)})\n`;
        }
        const versionCount = Object.keys(times).filter((k) => k !== "created" && k !== "modified").length;
        output += `- **Total versions published**: ${versionCount}\n`;
    }
    output += "\n";
    // Downloads
    output += `## Downloads\n\n`;
    if (downloads !== null) {
        output += `- **Weekly downloads**: ${formatDownloads(downloads)}\n`;
    }
    else {
        output += `- Weekly downloads: unavailable\n`;
    }
    output += "\n";
    // Maintainers
    output += `## Maintainers\n\n`;
    const maintainers = pkg.maintainers ?? [];
    output += `- **Count**: ${maintainers.length}\n`;
    if (maintainers.length > 0) {
        const names = maintainers.slice(0, 5).map((m) => m.name);
        output += `- **Names**: ${names.join(", ")}${maintainers.length > 5 ? ` (+${maintainers.length - 5} more)` : ""}\n`;
    }
    output += "\n";
    // GitHub info (if available)
    const repoUrl = pkg.repository?.url;
    const ghRepo = extractGitHubRepo(repoUrl);
    if (ghRepo) {
        const ghInfo = await fetchJSONSafe(`https://api.github.com/repos/${ghRepo}`);
        output += `## GitHub: ${ghRepo}\n\n`;
        if (ghInfo) {
            output += `- **Stars**: ${formatDownloads(ghInfo.stargazers_count)}\n`;
            output += `- **Open issues**: ${ghInfo.open_issues_count}\n`;
            output += `- **Forks**: ${formatDownloads(ghInfo.forks_count)}\n`;
            if (ghInfo.archived)
                output += `- **Status**: ARCHIVED\n`;
        }
        else {
            output += `- Could not fetch GitHub data (rate limit or private repo)\n`;
        }
        output += "\n";
    }
    // Health summary
    output += `## Health Summary\n\n`;
    const signals = [];
    if (times) {
        const lastPublished = times[latestVersion];
        if (lastPublished) {
            const daysSince = Math.floor((Date.now() - new Date(lastPublished).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince > 365)
                signals.push("WARNING: Not published in over a year");
            else if (daysSince > 180)
                signals.push("NOTE: Not published in over 6 months");
            else
                signals.push("OK: Recently maintained");
        }
    }
    if (maintainers.length === 1)
        signals.push("NOTE: Single maintainer (bus factor risk)");
    else if (maintainers.length >= 3)
        signals.push("OK: Multiple maintainers");
    if (downloads !== null) {
        if (downloads > 1_000_000)
            signals.push("OK: Very high download count (widely used)");
        else if (downloads > 100_000)
            signals.push("OK: High download count");
        else if (downloads < 100)
            signals.push("WARNING: Very low download count");
    }
    for (const signal of signals) {
        output += `- ${signal}\n`;
    }
    return { content: [{ type: "text", text: output.trim() }] };
}
//# sourceMappingURL=get-package-health.js.map