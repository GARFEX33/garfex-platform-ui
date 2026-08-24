import type { ResourcesScreen } from "./ResourcesExperienceState";

export type ResourcesSemanticOperation =
    | Readonly<{ kind: "show-menu" }>
    | Readonly<{ kind: "search"; query: string }>
    | Readonly<{ kind: "create" }>
    | Readonly<{ kind: "browse" }>
    | Readonly<{ kind: "return-home" }>;

export function screenForResourcesOperation(
    operation: ResourcesSemanticOperation,
): ResourcesScreen {
    return operation.kind === "show-menu" ? "menu" : operation.kind;
}
