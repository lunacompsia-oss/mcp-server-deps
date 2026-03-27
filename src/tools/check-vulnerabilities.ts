/**
 * check_vulnerabilities tool: Check a specific package for known
 * security vulnerabilities using the OSV.dev API.
 */

import { queryVulnerabilities, type OsvVulnerability } from "../lib/osv.js";

function formatSeverity(vuln: OsvVulnerability): string {
  if (!vuln.severity || vuln.severity.length === 0) return "Unknown";
  return vuln.severity.map((s) => `${s.type}: ${s.score}`).join(", ");
}

function formatAffectedRange(vuln: OsvVulnerability): string {
  if (!vuln.affected || vuln.affected.length === 0) return "Unknown range";
  const ranges: string[] = [];
  for (const affected of vuln.affected) {
    if (!affected.ranges) continue;
    for (const range of affected.ranges) {
      const events = range.events;
      const introduced = events.find((e) => e.introduced)?.introduced ?? "0";
      const fixed = events.find((e) => e.fixed)?.fixed;
      if (fixed) {
        ranges.push(`introduced: ${introduced}, fixed: ${fixed}`);
      } else {
        ranges.push(`introduced: ${introduced}, no fix available`);
      }
    }
  }
  return ranges.length > 0 ? ranges.join("; ") : "Unknown range";
}

function formatReferences(vuln: OsvVulnerability): string {
  if (!vuln.references || vuln.references.length === 0) return "";
  const refs = vuln.references.slice(0, 3);
  return refs.map((r) => `  - [${r.type}] ${r.url}`).join("\n");
}

export async function checkVulnerabilities(
  packageName: string,
  version?: string
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  let vulns: OsvVulnerability[];
  try {
    vulns = await queryVulnerabilities(packageName, "npm", version);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [
        {
          type: "text",
          text: `Error querying vulnerabilities for ${packageName}: ${message}`,
        },
      ],
    };
  }

  if (vulns.length === 0) {
    const versionText = version ? ` (version ${version})` : "";
    return {
      content: [
        {
          type: "text",
          text: `No known vulnerabilities found for **${packageName}**${versionText}.`,
        },
      ],
    };
  }

  let output = `# Vulnerabilities for ${packageName}${version ? ` v${version}` : ""}\n\n`;
  output += `Found **${vulns.length}** known vulnerabilit${vulns.length === 1 ? "y" : "ies"}.\n\n`;

  for (const vuln of vulns) {
    output += `## ${vuln.id}\n\n`;
    if (vuln.summary) output += `**Summary**: ${vuln.summary}\n`;
    output += `**Severity**: ${formatSeverity(vuln)}\n`;
    output += `**Affected range**: ${formatAffectedRange(vuln)}\n`;
    if (vuln.aliases && vuln.aliases.length > 0) {
      output += `**Aliases**: ${vuln.aliases.join(", ")}\n`;
    }
    if (vuln.published) output += `**Published**: ${vuln.published}\n`;
    if (vuln.modified) output += `**Modified**: ${vuln.modified}\n`;

    const refs = formatReferences(vuln);
    if (refs) {
      output += `**References**:\n${refs}\n`;
    }

    if (vuln.details) {
      const details = vuln.details.length > 500 ? vuln.details.slice(0, 500) + "..." : vuln.details;
      output += `\n${details}\n`;
    }

    output += "\n---\n\n";
  }

  return { content: [{ type: "text", text: output.trim() }] };
}
