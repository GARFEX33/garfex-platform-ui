import type { ResourcesExperience } from "../../surface/features/resources/ResourcesExperience";
import type { ResourcesProjection } from "../../surface/features/resources/ResourcesExperienceState";
import type { PiPresentation } from "./PiPresentation";

const RESOURCES_MENU = [
    "Buscar recurso",
    "Crear recurso",
    "Explorar recursos",
    "Volver",
] as const;

export class PiResourcesPresentation {
    constructor(
        private readonly pi: PiPresentation,
        private readonly resources: ResourcesExperience,
    ) {}

    async open(): Promise<void> {
        this.resources.showMenu();

        while (true) {
            const option = await this.pi.select(
                "GARFEX · Recursos maestros",
                RESOURCES_MENU,
            );

            if (!option || option === "Volver") {
                this.resources.returnHome();
                return;
            }

            if (option === "Buscar recurso") {
                await this.search();
            } else if (option === "Crear recurso") {
                this.showUnavailable(this.resources.create());
            } else if (option === "Explorar recursos") {
                this.showUnavailable(this.resources.browse());
            }
        }
    }

    private async search(): Promise<void> {
        const query = await this.pi.input(
            "Buscar recurso",
            "Nombre del recurso",
        );

        if (query === undefined) {
            return;
        }

        const projection = this.resources.search(query);

        this.showUnavailable(projection);
    }

    private showUnavailable(projection: ResourcesProjection): void {
        if (projection.clientCapability.kind === "unavailable") {
            this.pi.notify(
                "La integración real con GARFEX aún está pendiente; no hay datos simulados.",
                "warning",
            );
        }
    }
}
