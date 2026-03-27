/**
 * get_dependency_tree tool: Recursively resolve the dependency tree
 * for a specific npm package up to a given depth.
 */
export declare function getDependencyTree(packageName: string, version?: string, depth?: number): Promise<{
    content: Array<{
        type: "text";
        text: string;
    }>;
}>;
//# sourceMappingURL=get-dependency-tree.d.ts.map