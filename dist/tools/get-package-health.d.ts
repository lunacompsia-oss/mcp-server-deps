/**
 * get_package_health tool: Fetch health and quality metrics for an npm package.
 * Last publish date, weekly downloads, maintainer count, GitHub stars, open issues.
 */
export declare function getPackageHealth(packageName: string): Promise<{
    content: Array<{
        type: "text";
        text: string;
    }>;
}>;
//# sourceMappingURL=get-package-health.d.ts.map