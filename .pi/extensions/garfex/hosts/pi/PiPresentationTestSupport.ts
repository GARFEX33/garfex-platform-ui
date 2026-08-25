import type { Theme } from "@earendil-works/pi-coding-agent";
import type { TUI } from "@earendil-works/pi-tui";

export class FakeTui {
    readonly terminal = { rows: 24 };

    requestRender(): void {}
}

export const fakeTheme = {
    fg: (_color: string, text: string) => text,
    bold: (text: string) => text,
} as unknown as Theme;

export function asTui(tui: FakeTui): TUI {
    return tui as unknown as TUI;
}
