import type { SearchActiveResources } from "../../application/use-cases/SearchActiveResources";
import type { Resource } from "../../domain/resources/Resource";
import type { UiPort } from "../../ui/UiPort";

const MENU = [
    "Buscar recurso",
    "Crear recurso",
    "Configuración de recursos",
    "Volver",
] as const;

export class ResourcesModule {
    constructor(
        private readonly ui: UiPort,
        private readonly searchActiveResources: SearchActiveResources,
    ) { }

    async open(): Promise<void> {
        while (true) {
            const option = await this.ui.select(
                "GARFEX · Recursos Maestros",
                MENU,
            );

            if (!option || option === "Volver") {
                return;
            }

            switch (option) {
                case "Buscar recurso":
                    await this.search();
                    break;

                case "Crear recurso":
                    this.ui.notify(
                        "Crear recurso estará disponible próximamente.",
                    );
                    break;

                case "Configuración de recursos":
                    this.ui.notify(
                        "Configuración de recursos estará disponible próximamente.",
                    );
                    break;
            }
        }
    }

    private async search(): Promise<void> {
        const query = await this.ui.input(
            "Buscar recurso",
            "Nombre del recurso",
        );

        if (query === undefined) {
            return;
        }

        const resources =
            await this.searchActiveResources.execute(query);

        if (resources.length === 0) {
            this.ui.notify(
                "No se encontraron recursos.",
                "info",
            );
            return;
        }

        await this.showResults(resources);
    }

    private async showResults(
        resources: Resource[],
    ): Promise<void> {
        const names = resources.map(
            (resource) => resource.name,
        );

        const selectedName = await this.ui.select(
            `GARFEX · ${resources.length} recurso(s) encontrado(s)`,
            names,
        );

        if (!selectedName) {
            return;
        }

        const resource = resources.find(
            (item) => item.name === selectedName,
        );

        if (!resource) {
            return;
        }

        this.ui.notify(
            `Detalle de ${resource.name}: disponible próximamente.`,
        );
    }
}