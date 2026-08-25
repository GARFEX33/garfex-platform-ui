import {
    initTheme,
    type KeybindingsManager as CodingAgentKeybindingsManager,
    type Theme,
} from "@earendil-works/pi-coding-agent";
import { KeybindingsManager as CodingAgentKeybindingsManagerValue } from "../../../../../node_modules/@earendil-works/pi-coding-agent/dist/core/keybindings.js";
import { setKeybindings as setCodingAgentKeybindings } from "../../../../../node_modules/@earendil-works/pi-coding-agent/node_modules/@earendil-works/pi-tui/dist/index.js";
import {
    KeybindingsManager as TuiKeybindingsManager,
    TUI_KEYBINDINGS,
    setKeybindings as setTuiKeybindings,
    type TUI,
} from "@earendil-works/pi-tui";

initTheme("dark", false);

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

type CodingAgentKeybindingsConfig = NonNullable<
    ConstructorParameters<typeof CodingAgentKeybindingsManagerValue>[0]
>;

export function createTestKeybindings(
    userBindings: CodingAgentKeybindingsConfig = {},
): CodingAgentKeybindingsManager {
    const codingAgentKeybindings = new CodingAgentKeybindingsManagerValue(
        userBindings,
    );
    const tuiKeybindings = new TuiKeybindingsManager(
        TUI_KEYBINDINGS,
        userBindings,
    );
    setTuiKeybindings(tuiKeybindings);
    setCodingAgentKeybindings(codingAgentKeybindings);
    return codingAgentKeybindings;
}
