import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

export type GarfexCommandResult = "closed" | "tui-required" | "failed";

export function reportTuiRequired(context: ExtensionCommandContext): void {
    if (context.hasUI) {
        context.ui.notify(
            "GARFEX solo puede abrirse en una sesión interactiva. Inicia una e inténtalo de nuevo.",
            "warning",
        );
        return;
    }

    process.stderr.write(
        "GARFEX solo puede abrirse en una sesión interactiva. Inicia una e inténtalo de nuevo.\n",
    );
}

export function reportSafeFailure(context: ExtensionCommandContext): void {
    if (context.hasUI) {
        context.ui.notify(
            "No se pudo abrir GARFEX. Inténtalo de nuevo.",
            "error",
        );
        return;
    }

    process.stderr.write(
        "No se pudo abrir GARFEX. Inicia una sesión interactiva e inténtalo de nuevo.\n",
    );
}
