import type { ResourcesIntent } from "./ResourcesExperienceOperations.ts";
import type {
    ResourcesProjection,
    ResourcesTransition,
} from "./ResourcesExperienceState.ts";

const INITIAL_PROJECTION: ResourcesProjection = {
    location: "resources",
    searchDraft: "",
    availability: "search-unavailable",
};

export class ResourcesExperience {
    private projection: ResourcesProjection = INITIAL_PROJECTION;

    project(): ResourcesProjection {
        return this.projection;
    }

    openSearch(): ResourcesTransition {
        return this.apply({ kind: "open-search" });
    }

    changeSearchDraft(draft: string): ResourcesTransition {
        return this.apply({ kind: "change-search-draft", draft });
    }

    cancelSearch(): ResourcesTransition {
        return this.apply({ kind: "cancel-search" });
    }

    returnHome(): ResourcesTransition {
        return this.apply({ kind: "return-home" });
    }

    private apply(intent: ResourcesIntent): ResourcesTransition {
        if (intent.kind === "open-search") {
            this.projection = { ...this.projection, location: "search" };
        } else if (intent.kind === "change-search-draft") {
            this.projection = { ...this.projection, searchDraft: intent.draft };
        } else if (intent.kind === "cancel-search") {
            this.projection = { ...this.projection, location: "resources" };
        }

        return {
            projection: this.projection,
            effects:
                intent.kind === "return-home" ? [{ kind: "return-home" }] : [],
        };
    }
}
