import type { SelectItem } from "@earendil-works/pi-tui";

import type { ResourcesProjection } from "../../surface/features/resources/ResourcesExperienceState.ts";

export type ResourcesChoice = "search" | "back";

export type ResourcesHint =
    | Readonly<{
          kind: "search";
          typing: string;
          cancel: string;
      }>
    | Readonly<{
          kind: "menu";
          movement: string;
          confirm: string;
          cancel: string;
      }>;

export type ResourcesView = Readonly<{
    title: string;
    description: string;
    hint: ResourcesHint;
    items: readonly SelectItem[];
}>;

export function resourcesView(projection: ResourcesProjection): ResourcesView {
    if (projection.location === "search") {
        return {
            title: "Buscar recurso",
            description:
                "La búsqueda todavía no está disponible. Puedes preparar un borrador y conservarlo mientras GARFEX permanezca abierto.",
            hint: {
                kind: "search",
                typing: "Escribe para preparar el borrador",
                cancel: "volver a Recursos",
            },
            items: [],
        };
    }

    return {
        title: "Recursos maestros",
        description:
            "La búsqueda estará disponible próximamente. Puedes preparar y conservar un borrador.",
        hint: {
            kind: "menu",
            movement: "mover",
            confirm: "elegir",
            cancel: "volver a GARFEX",
        },
        items: [
            {
                value: "search",
                label: "Preparar búsqueda",
                description:
                    "Escribe y conserva un borrador para usarlo más adelante.",
            },
            { value: "back", label: "Volver a GARFEX" },
        ],
    };
}
