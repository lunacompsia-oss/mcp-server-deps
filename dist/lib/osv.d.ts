/**
 * OSV.dev API helpers for vulnerability data.
 * OSV is free, open, and covers multiple ecosystems.
 */
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
            events: Array<{
                introduced?: string;
                fixed?: string;
            }>;
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
export declare function queryVulnerabilities(packageName: string, ecosystem: string, version?: string): Promise<OsvVulnerability[]>;
//# sourceMappingURL=osv.d.ts.map