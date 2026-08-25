export type ResourcesLocation = "resources" | "search";

export type ResourcesProjection = Readonly<{
    location: ResourcesLocation;
    searchDraft: string;
    availability: "search-unavailable";
}>;

export type ResourcesEffect = Readonly<{ kind: "return-home" }>;

export type ResourcesTransition = Readonly<{
    projection: ResourcesProjection;
    effects: readonly ResourcesEffect[];
}>;
