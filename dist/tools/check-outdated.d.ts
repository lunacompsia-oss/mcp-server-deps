/**
 * check_outdated tool: Parse package.json and compare dependency versions
 * against the latest published versions on npm.
 */
export declare function checkOutdated(packageJsonContent: string): Promise<{
    content: Array<{
        type: "text";
        text: string;
    }>;
}>;
//# sourceMappingURL=check-outdated.d.ts.map