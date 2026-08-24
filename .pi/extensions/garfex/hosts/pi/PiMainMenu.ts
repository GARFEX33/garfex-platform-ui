import type { PiPresentation } from "./PiPresentation";
import type { PiResourcesPresentation } from "./PiResourcesPresentation";

const MAIN_MENU = [
    "Recursos maestros",
    "Proveedores",
    "Configuración",
    "Salir",
] as const;

export class PiMainMenu {
    constructor(
        private readonly pi: PiPresentation,
        private readonly resources: PiResourcesPresentation,
    ) {}

    async open(): Promise<void> {
        while (true) {
            const option = await this.pi.select(
                "GARFEX · Menú principal",
                MAIN_MENU,
            );

            if (!option || option === "Salir") {
                return;
            }

            if (option === "Recursos maestros") {
                await this.resources.open();
            } else if (option === "Proveedores") {
                this.pi.notify("Proveedores estará disponible próximamente.");
            } else if (option === "Configuración") {
                this.pi.notify("Configuración estará disponible próximamente.");
            }
        }
    }
}
