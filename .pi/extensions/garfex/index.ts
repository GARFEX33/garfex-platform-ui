import type {
    ExtensionAPI,
    ExtensionCommandContext,
} from "@earendil-works/pi-coding-agent";

import { openPiSurface } from "./composition/createPiSurface.ts";
import {
    reportSafeFailure,
    reportTuiRequired,
    type GarfexCommandResult,
} from "./hosts/pi/PiRuntime.ts";

export async function runGarfexCommand(
    context: ExtensionCommandContext,
): Promise<GarfexCommandResult> {
    if (context.mode !== "tui") {
        reportTuiRequired(context);
        return "tui-required";
    }

    try {
        await openPiSurface(context);
        return "closed";
    } catch {
        reportSafeFailure(context);
        return "failed";
    }
}

export default function garfexSurfaceExtension(pi: ExtensionAPI): void {
    pi.registerCommand("garfex", {
        description: "Abrir GARFEX",
        handler: async (_args, context) => {
            await runGarfexCommand(context);
        },
    });
}
