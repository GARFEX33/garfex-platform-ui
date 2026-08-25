export type ResourcesIntent =
    | Readonly<{ kind: "open-search" }>
    | Readonly<{ kind: "change-search-draft"; draft: string }>
    | Readonly<{ kind: "cancel-search" }>
    | Readonly<{ kind: "return-home" }>;
