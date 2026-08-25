import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

import { GarfexSurfaceComponent } from "../hosts/pi/PiPresentation.ts";

export async function openPiSurface(
    context: ExtensionCommandContext,
): Promise<void> {
    await context.ui.custom<void>(
        (tui, theme, keybindings, done) =>
            new GarfexSurfaceComponent(tui, theme, keybindings, () => done()),
    );
}
