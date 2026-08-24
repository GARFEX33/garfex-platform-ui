import type { PiCommandContext, PiNotificationType } from "./PiRuntime";

export class PiPresentation {
    constructor(private readonly context: PiCommandContext) {}

    select(
        title: string,
        options: readonly string[],
    ): Promise<string | undefined> {
        return this.context.ui.select(title, [...options]);
    }

    input(title: string, placeholder?: string): Promise<string | undefined> {
        return this.context.ui.input(title, placeholder);
    }

    notify(message: string, type: PiNotificationType = "info"): void {
        this.context.ui.notify(message, type);
    }
}
