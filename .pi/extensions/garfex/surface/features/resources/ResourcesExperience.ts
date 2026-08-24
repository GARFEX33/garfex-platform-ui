import {
    screenForResourcesOperation,
    type ResourcesSemanticOperation,
} from "./ResourcesExperienceOperations";
import type {
    ResourcesExperienceState,
    ResourcesProjection,
} from "./ResourcesExperienceState";

const CLIENT_CAPABILITY_UNAVAILABLE = {
    kind: "unavailable",
    reason: "client-contract-not-materialized",
} as const;

export class ResourcesExperience {
    private state: ResourcesExperienceState = {
        screen: "menu",
        query: "",
        clientCapability: CLIENT_CAPABILITY_UNAVAILABLE,
    };

    showMenu(): ResourcesProjection {
        return this.apply({ kind: "show-menu" });
    }

    search(query: string): ResourcesProjection {
        return this.apply({ kind: "search", query });
    }

    create(): ResourcesProjection {
        return this.apply({ kind: "create" });
    }

    browse(): ResourcesProjection {
        return this.apply({ kind: "browse" });
    }

    returnHome(): ResourcesProjection {
        return this.apply({ kind: "return-home" });
    }

    project(): ResourcesProjection {
        return this.state;
    }

    private apply(operation: ResourcesSemanticOperation): ResourcesProjection {
        this.state = {
            screen: screenForResourcesOperation(operation),
            query: operation.kind === "search" ? operation.query : "",
            clientCapability: CLIENT_CAPABILITY_UNAVAILABLE,
        };

        return this.state;
    }
}
