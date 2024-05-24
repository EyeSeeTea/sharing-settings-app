export const dataStoreNamespace = "sharing-settings-app";
export const constantPrefix = "Sharing Settings App Storage";

export type Namespace = typeof Namespaces[keyof typeof Namespaces];

export const Namespaces = {
    EXCLUDED_DEPENDENCIES: "excludedDependencies",
};

export const NamespaceProperties: Record<Namespace, string[]> = {
    [Namespaces.EXCLUDED_DEPENDENCIES]: [],
};
