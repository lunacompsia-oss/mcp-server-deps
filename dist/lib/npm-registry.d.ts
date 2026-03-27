/**
 * npm registry API helpers.
 * Fetches package metadata, versions, and download stats.
 */
export interface NpmPackageLatest {
    name: string;
    version: string;
    description?: string;
    dependencies?: Record<string, string>;
}
export interface NpmPackageFull {
    name: string;
    "dist-tags": Record<string, string>;
    time: Record<string, string>;
    maintainers: Array<{
        name: string;
        email?: string;
    }>;
    repository?: {
        type?: string;
        url?: string;
    };
    description?: string;
    license?: string;
    versions: Record<string, NpmPackageLatest>;
}
export interface NpmDownloads {
    downloads: number;
    start: string;
    end: string;
    package: string;
}
export declare function getLatestVersion(packageName: string): Promise<string>;
export declare function getPackageVersion(packageName: string, version: string): Promise<NpmPackageLatest>;
export declare function getPackageFull(packageName: string): Promise<NpmPackageFull>;
export declare function getWeeklyDownloads(packageName: string): Promise<number | null>;
export declare function getPackageDependencies(packageName: string, version?: string): Promise<Record<string, string>>;
//# sourceMappingURL=npm-registry.d.ts.map