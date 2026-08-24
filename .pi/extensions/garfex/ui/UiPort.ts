export interface UiPort {
    select(
        title: string,
        options: readonly string[],
    ): Promise<string | undefined>;

    input(
        title: string,
        placeholder?: string,
    ): Promise<string | undefined>;

    notify(
        message: string,
        type?: "info" | "warning" | "error",
    ): void;
}