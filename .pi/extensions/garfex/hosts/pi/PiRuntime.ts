export type PiNotificationType = "info" | "warning" | "error";

export interface PiCommandUi {
    select(title: string, options: string[]): Promise<string | undefined>;
    input(title: string, placeholder?: string): Promise<string | undefined>;
    notify(message: string, type: PiNotificationType): void;
}

export interface PiCommandContext {
    ui: PiCommandUi;
}

export interface PiCommandRegistration {
    description: string;
    handler(args: string, context: PiCommandContext): void | Promise<void>;
}

export interface PiExtensionApi {
    registerCommand(name: string, command: PiCommandRegistration): void;
}
