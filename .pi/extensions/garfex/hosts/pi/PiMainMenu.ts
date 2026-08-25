import type { SelectItem } from "@earendil-works/pi-tui";

export type GarfexHomeChoice = "resources" | "close";

export const GARFEX_HOME_ITEMS: SelectItem[] = [
    {
        value: "resources",
        label: "Recursos maestros",
        description: "Prepara y conserva un borrador de búsqueda.",
    },
    { value: "close", label: "Cerrar GARFEX" },
];
