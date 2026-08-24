// app/MainMenu.ts

import { ResourcesModule } from "../modules/resources/ResourcesModule";
import type { UiPort } from "../ui/UiPort";

const MENU = [
    "Recursos Maestros",
    "Proveedores",
    "Configuración",
    "Salir",
] as const;

export class MainMenu {
    constructor(
        private readonly ui: UiPort,
        private readonly resources: ResourcesModule,
    ) { }

    async open(): Promise<void> {
        while (true) {
            const option = await this.ui.select(
                "GARFEX · Menú principal",
                MENU,
            );

            if (!option || option === "Salir") {
                return;
            }

            switch (option) {
                case "Recursos Maestros":
                    await this.resources.open();
                    break;

                case "Proveedores":
                    this.ui.notify(
                        "Proveedores estará disponible próximamente.",
                    );
                    break;

                case "Configuración":
                    this.ui.notify(
                        "Configuración estará disponible próximamente.",
                    );
                    break;
            }
        }
    }
}