import assert from "node:assert/strict";
import test from "node:test";

import {
    CURSOR_MARKER,
    type KeybindingsConfig,
    visibleWidth,
} from "@earendil-works/pi-tui";

import { GarfexSurfaceComponent } from "./PiPresentation.ts";
import {
    asTui,
    createTestKeybindings,
    fakeTheme,
    FakeTui,
} from "./PiPresentationTestSupport.ts";

const REMAPPED_BINDINGS: KeybindingsConfig = {
    "tui.select.up": "alt+k",
    "tui.select.down": "alt+j",
    "tui.select.confirm": "ctrl+enter",
    "tui.select.cancel": "ctrl+x",
};

function createSurface(userBindings: KeybindingsConfig = {}) {
    let closed = false;
    const tui = new FakeTui();
    const keybindings = createTestKeybindings(userBindings);
    const surface = new GarfexSurfaceComponent(
        asTui(tui),
        fakeTheme,
        keybindings,
        () => {
            closed = true;
        },
    );
    return { surface, tui, isClosed: () => closed };
}

test("native single-line Input keeps the exact search draft", () => {
    const { surface } = createSurface();
    surface.choose("resources");
    surface.choose("search");
    surface.handleInput("  pieza-ñ 42  ");
    surface.handleInput("\n");

    assert.equal(surface.searchDraft(), "  pieza-ñ 42  ");
});

test("native Ctrl+C cancel returns from Search to Resources without clearing the draft", () => {
    const { surface } = createSurface();
    surface.choose("resources");
    surface.choose("search");
    surface.handleInput("texto");

    surface.handleInput("\x03");

    assert.equal(surface.currentLocation(), "resources");
    assert.equal(surface.searchDraft(), "texto");
});

test("escape follows Search -> Resources -> GARFEX -> close", () => {
    const { surface, isClosed } = createSurface();
    surface.choose("resources");
    surface.choose("search");
    surface.handleInput("texto");
    surface.handleInput("\u001b");
    assert.equal(surface.currentLocation(), "resources");
    surface.choose("search");
    surface.handleInput("\u001b");
    assert.equal(surface.currentLocation(), "resources");
    surface.handleInput("\u001b");
    assert.equal(surface.currentLocation(), "home");
    surface.handleInput("\u001b");
    assert.equal(isClosed(), true);
});

test("native rendering stays within narrow widths", () => {
    const { surface } = createSurface();
    surface.choose("resources");
    surface.choose("search");
    for (const width of [1, 8, 20]) {
        const lines = surface.render(width);
        assert.ok(lines.length > 0);
        assert.ok(lines.every((line) => visibleWidth(line) <= width));
    }
});

test("reopened search preserves the native Input draft, cursor, and focus", () => {
    const { surface } = createSurface();
    surface.focused = true;
    surface.choose("resources");
    surface.choose("search");
    surface.handleInput("ac");
    surface.handleInput("\u001b[D");
    surface.handleInput("\u001b");
    surface.choose("search");
    surface.handleInput("b");

    assert.equal(surface.searchDraft(), "abc");
    const rendered = surface.render(60).join("\n");
    assert.ok(rendered.includes(CURSOR_MARKER));
});

test("Search state survives a Home round trip only within its Surface lifetime", () => {
    const first = createSurface();
    first.surface.focused = true;
    first.surface.choose("resources");
    first.surface.choose("search");
    first.surface.handleInput("  pieza-ñ 42  ");
    first.surface.handleInput("\u001b[D");
    first.surface.handleInput("\u001b[D");

    first.surface.handleInput("\u001b");
    first.surface.handleInput("\u001b");
    first.surface.choose("resources");
    first.surface.choose("search");

    assert.equal(first.surface.searchDraft(), "  pieza-ñ 42  ");
    assert.ok(first.surface.render(80).join("\n").includes(CURSOR_MARKER));
    first.surface.handleInput("X");
    assert.equal(first.surface.searchDraft(), "  pieza-ñ 42X  ");

    first.surface.handleInput("\u001b");
    first.surface.handleInput("\u001b");
    first.surface.handleInput("\u001b");
    assert.equal(first.isClosed(), true);

    const second = createSurface();
    second.surface.choose("resources");
    second.surface.choose("search");
    assert.equal(second.surface.searchDraft(), "");
});

test("combining Unicode keeps code points and insertion position after Search reopens", () => {
    const { surface } = createSurface();
    surface.focused = true;
    surface.choose("resources");
    surface.choose("search");

    surface.handleInput("Cafe\u0301");
    surface.handleInput("\x1b[D");
    surface.handleInput("X");
    surface.handleInput("\x18");
    surface.choose("search");

    assert.equal(surface.searchDraft(), "CafXe\u0301");
    assert.deepEqual(
        [...surface.searchDraft()],
        ["C", "a", "f", "X", "e", "\u0301"],
    );
    assert.ok(surface.render(60).join("\n").includes(CURSOR_MARKER));
});

test("long drafts remain exact and rendered lines stay within a narrow width", () => {
    const { surface } = createSurface();
    surface.focused = true;
    surface.choose("resources");
    surface.choose("search");
    const draft = "recurso-".repeat(20);
    surface.handleInput(draft);

    const width = 8;
    const firstRender = surface.render(width);
    assert.equal(surface.searchDraft(), draft);
    assert.ok(
        firstRender.every(
            (line) => visibleWidth(line) <= Math.max(1, Math.floor(width)),
        ),
    );

    surface.handleInput("\x18");
    surface.choose("search");
    const reopenedRender = surface.render(width);
    assert.equal(surface.searchDraft(), draft);
    assert.ok(
        reopenedRender.every(
            (line) => visibleWidth(line) <= Math.max(1, Math.floor(width)),
        ),
    );
});

test("bracketed paste keeps line-safe whitespace exact without executing a draft", () => {
    const { surface, isClosed } = createSurface();
    surface.focused = true;
    surface.choose("resources");
    surface.choose("search");
    surface.handleInput("\x1b[200~  uno\t dos  \x1b[201~");

    const nativePaste = "  uno     dos  ";
    assert.equal(surface.searchDraft(), nativePaste);
    assert.equal(surface.currentLocation(), "search");
    assert.equal(isClosed(), false);

    surface.handleInput("\x18");
    surface.choose("search");
    assert.equal(surface.searchDraft(), nativePaste);
});

test("repeated navigation and resize preserve recovery and truthful availability", () => {
    const { surface } = createSurface();
    surface.focused = true;
    const widths = [60, 20, 8, 1];

    for (const width of widths) {
        const safeWidth = Math.max(1, Math.floor(width));
        const homeRender = surface.render(width);
        assert.ok(homeRender.every((line) => visibleWidth(line) <= safeWidth));

        surface.choose("resources");
        const resourcesRender = surface.render(width);
        assert.ok(
            resourcesRender.every((line) => visibleWidth(line) <= safeWidth),
        );

        surface.choose("search");
        const searchRender = surface.render(width);
        assert.ok(
            searchRender.every((line) => visibleWidth(line) <= safeWidth),
        );
        if (width === 60) {
            assert.ok(searchRender.join("\n").includes("no está disponible"));
        }

        surface.handleInput("\x1b");
        assert.equal(surface.currentLocation(), "resources");
        surface.handleInput("\x1b");
        assert.equal(surface.currentLocation(), "home");
    }
});

test("remapped Pi bindings drive Spanish help without inactive defaults", () => {
    const { surface } = createSurface(REMAPPED_BINDINGS);
    const rendered = surface.render(120).join("\n");

    assert.ok(rendered.includes("alt+k"));
    assert.ok(rendered.includes("alt+j"));
    assert.ok(rendered.includes("ctrl+enter"));
    assert.ok(rendered.includes("ctrl+x"));
    assert.equal(rendered.includes("↑/↓"), false);
    assert.equal(rendered.includes("Enter"), false);
    assert.equal(rendered.includes("Esc"), false);
});

test("native selection and Search expose additive textual active cues", () => {
    const { surface } = createSurface();
    const firstHomeRender = surface.render(80).join("\n");
    assert.ok(firstHomeRender.includes("Activa: Recursos maestros"));

    surface.handleInput("\x1b[B");
    const secondHomeRender = surface.render(80).join("\n");
    assert.ok(secondHomeRender.includes("Activa: Cerrar GARFEX"));

    surface.focused = true;
    surface.choose("resources");
    surface.choose("search");
    const searchRender = surface.render(80).join("\n");
    assert.ok(searchRender.includes("Campo activo: borrador de búsqueda"));
    assert.ok(searchRender.includes(CURSOR_MARKER));
});

test("remapped cancel follows the hierarchy and raw Escape is not an active binding", () => {
    const { surface, isClosed } = createSurface(REMAPPED_BINDINGS);
    surface.focused = true;
    surface.choose("resources");
    surface.choose("search");

    surface.handleInput("\x18");
    assert.equal(surface.currentLocation(), "resources");

    surface.choose("search");
    surface.handleInput("dato");
    surface.handleInput("\u001b");
    assert.equal(surface.currentLocation(), "search");
    const ignoredEscapeRender = surface.render(80).join("\n");
    assert.ok(ignoredEscapeRender.includes("dato"));
    assert.ok(ignoredEscapeRender.includes(CURSOR_MARKER));

    surface.handleInput("\x18");
    assert.equal(surface.currentLocation(), "resources");
    surface.handleInput("\x18");
    assert.equal(surface.currentLocation(), "home");
    surface.handleInput("\x18");
    assert.equal(isClosed(), true);
});
