import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import type { UiPort } from "./UiPort";

export class PiUiAdapter implements UiPort {
    constructor(
        private readonly ctx: ExtensionCommandContext,
    ) { }

    select(
        title: string,
        options: readonly string[],
    ): Promise<string | undefined> {
        return this.ctx.ui.select(title, [...options]);
    }

    input(
        title: string,
        placeholder?: string,
    ): Promise<string | undefined> {
        return this.ctx.ui.input(title, placeholder);
    }

    notify(
        message: string,
        type: "info" | "warning" | "error" = "info",
    ): void {
        this.ctx.ui.notify(message, type);
    }
}