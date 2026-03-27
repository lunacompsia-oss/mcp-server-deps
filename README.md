# mcp-server-deps

> Part of the [Dependency Intelligence Suite](https://lunacompsia-landing.pages.dev/) by Lunacompsia
>
> [mcp-server-changelog](https://github.com/lunacompsia-oss/mcp-server-changelog) — What changed? | **mcp-server-deps** — What's broken? | [mcp-server-license](https://github.com/lunacompsia-oss/mcp-server-license) — What's allowed?

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Dependency intelligence for AI assistants.

An MCP (Model Context Protocol) server that gives AI assistants real-time access to dependency health data: outdated packages, known vulnerabilities, dependency trees, and package quality metrics.

## Tools

### check_outdated

Check for outdated dependencies in a project. Provide the content of a `package.json` and get back a list of outdated packages with current vs latest versions, grouped by update type (major/minor/patch).

```
Input: { package_json: '{"dependencies": {"express": "4.18.0"}}' }
Output: express: 4.18.0 -> 4.21.2 (minor)
```

### check_vulnerabilities

Check a specific package for known security vulnerabilities using the OSV.dev database. Returns vulnerability IDs, severity scores, affected version ranges, and fix information.

```
Input: { package_name: "lodash", version: "4.17.20" }
Output: GHSA-xxxx - Prototype Pollution (fixed in 4.17.21)
```

### get_dependency_tree

Get the dependency tree for an npm package, resolved recursively up to a configurable depth (1-5). Displays as an ASCII tree showing all transitive dependencies.

```
Input: { package_name: "express", depth: 2 }
Output: ASCII tree of express and its dependencies
```

### get_package_health

Get health and quality metrics for a package: last publish date, weekly downloads, maintainer count, total versions published, and GitHub stats (stars, open issues, forks). Includes a health summary with warnings for stale or risky packages.

```
Input: { package_name: "react" }
Output: Health report with publish history, downloads, maintainers, GitHub stats
```

## Installation

Run directly with npx:

```bash
npx -y github:lunacompsia-oss/mcp-server-deps
```

Or clone and build:

```bash
git clone https://github.com/lunacompsia-oss/mcp-server-deps.git
cd mcp-server-deps
npm install
npm run build
```

## Claude Desktop Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "deps": {
      "command": "npx",
      "args": ["-y", "github:lunacompsia-oss/mcp-server-deps"]
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | No | GitHub personal access token for higher API rate limits when fetching repository stats |

## Data Sources

- **npm registry** - Package metadata, versions, download counts
- **OSV.dev** - Open Source Vulnerabilities database (free, covers npm and many other ecosystems)
- **GitHub API** - Repository stats (stars, issues, forks)

## License

MIT
