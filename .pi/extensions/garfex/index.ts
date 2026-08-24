// index.ts

import type {
    ExtensionAPI,
} from "@earendil-works/pi-coding-agent";

import { GarfexApp } from "./app/GarfexApp";
import { PiUiAdapter } from "./ui/PiUiAdapter";

export default function garfexExtension(pi: ExtensionAPI): void {
    pi.registerCommand("garfex", {
        description: "Abrir GARFEX",

        handler: async (_args, ctx) => {
            const ui = new PiUiAdapter(ctx);
            const app = new GarfexApp(ui);

            await app.run();
        },
    });
}