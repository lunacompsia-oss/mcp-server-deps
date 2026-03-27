#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { checkOutdated } from "./tools/check-outdated.js";
import { checkVulnerabilities } from "./tools/check-vulnerabilities.js";
import { getDependencyTree } from "./tools/get-dependency-tree.js";
import { getPackageHealth } from "./tools/get-package-health.js";

const server = new McpServer({
  name: "mcp-server-deps",
  version: "0.1.0",
});

// Tool 1: Check for outdated dependencies in a project
server.tool(
  "check_outdated",
  "Check for outdated dependencies in a project. Parses package.json content and compares each dependency against the latest version on npm. Returns which packages are outdated with current vs latest versions and update type (major/minor/patch).",
  {
    package_json: z
      .string()
      .describe("The full content of a package.json file as a string"),
    registry: z
      .enum(["npm"])
      .default("npm")
      .describe("Package registry to check against"),
  },
  async ({ package_json }) => {
    return await checkOutdated(package_json);
  }
);

// Tool 2: Check a package for known security vulnerabilities
server.tool(
  "check_vulnerabilities",
  "Check a specific package for known security vulnerabilities using the OSV.dev database. Returns vulnerability IDs, severity, affected versions, and fix information.",
  {
    package_name: z
      .string()
      .describe("Package name (e.g., 'lodash', 'express')"),
    version: z
      .string()
      .optional()
      .describe("Specific version to check (defaults to checking all versions)"),
    registry: z
      .enum(["npm"])
      .default("npm")
      .describe("Package registry/ecosystem"),
  },
  async ({ package_name, version }) => {
    return await checkVulnerabilities(package_name, version);
  }
);

// Tool 3: Get the dependency tree for a package
server.tool(
  "get_dependency_tree",
  "Get the dependency tree for a specific npm package. Recursively resolves what it depends on, displayed as an ASCII tree. Useful for understanding transitive dependencies and package weight.",
  {
    package_name: z
      .string()
      .describe("Package name (e.g., 'express', 'next')"),
    version: z
      .string()
      .optional()
      .describe("Specific version (defaults to latest)"),
    depth: z
      .number()
      .int()
      .min(1)
      .max(5)
      .default(2)
      .describe("Maximum depth to resolve (1-5, default 2)"),
  },
  async ({ package_name, version, depth }) => {
    return await getDependencyTree(package_name, version, depth);
  }
);

// Tool 4: Get health and quality metrics for a package
server.tool(
  "get_package_health",
  "Get health and quality metrics for an npm package: last publish date, weekly downloads, maintainer count, version history, and GitHub stats (stars, issues, forks). Includes a health summary with warnings.",
  {
    package_name: z
      .string()
      .describe("Package name (e.g., 'react', 'fastify')"),
    registry: z
      .enum(["npm"])
      .default("npm")
      .describe("Package registry"),
  },
  async ({ package_name }) => {
    return await getPackageHealth(package_name);
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.stderr.write(`Fatal error: ${error}\n`);
  process.exit(1);
});
