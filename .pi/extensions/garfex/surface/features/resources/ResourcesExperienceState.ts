export type ResourcesScreen =
    | "menu"
    | "search"
    | "create"
    | "browse"
    | "return-home";

export type ResourcesClientCapabilityStatus = Readonly<{
    kind: "unavailable";
    reason: "client-contract-not-materialized";
}>;

export type ResourcesExperienceState = Readonly<{
    screen: ResourcesScreen;
    query: string;
    clientCapability: ResourcesClientCapabilityStatus;
}>;

export type ResourcesProjection = ResourcesExperienceState;
