import { createPiSurface } from "./composition/createPiSurface";
import type { PiCommandContext, PiExtensionApi } from "./hosts/pi/PiRuntime";

export default function garfexSurfaceExtension(pi: PiExtensionApi): void {
    pi.registerCommand("garfex", {
        description: "Abrir GARFEX",
        handler: async (
            _args: string,
            context: PiCommandContext,
        ): Promise<void> => {
            const surface = createPiSurface(context);

            await surface.open();
        },
    });
}
