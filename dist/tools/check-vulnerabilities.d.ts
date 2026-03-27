/**
 * check_vulnerabilities tool: Check a specific package for known
 * security vulnerabilities using the OSV.dev API.
 */
export declare function checkVulnerabilities(packageName: string, version?: string): Promise<{
    content: Array<{
        type: "text";
        text: string;
    }>;
}>;
//# sourceMappingURL=check-vulnerabilities.d.ts.map