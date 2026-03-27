/**
 * OSV.dev API helpers for vulnerability data.
 * OSV is free, open, and covers multiple ecosystems.
 */

import { fetchJSON } from "./fetcher.js";

const OSV_API = "https://api.osv.dev/v1/query";

export interface OsvVulnerability {
  id: string;
  summary?: string;
  details?: string;
  aliases?: string[];
  severity?: Array<{
    type: string;
    score: string;
  }>;
  affected?: Array<{
    package?: {
      name: string;
      ecosystem: string;
    };
    ranges?: Array<{
      type: string;
      events: Array<{ introduced?: string; fixed?: string }>;
    }>;
  }>;
  references?: Array<{
    type: string;
    url: string;
  }>;
  published?: string;
  modified?: string;
}

export interface OsvResponse {
  vulns?: OsvVulnerability[];
}

export async function queryVulnerabilities(
  packageName: string,
  ecosystem: string,
  version?: string
): Promise<OsvVulnerability[]> {
  const body: Record<string, unknown> = {
    package: {
      name: packageName,
      ecosystem,
    },
  };

  if (version) {
    body.version = version;
  }

  const data = await fetchJSON<OsvResponse>(OSV_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return data.vulns ?? [];
}
