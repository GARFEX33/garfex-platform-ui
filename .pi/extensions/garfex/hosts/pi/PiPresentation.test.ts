import assert from "node:assert/strict";
import test from "node:test";

import { CURSOR_MARKER, visibleWidth } from "@earendil-works/pi-tui";

import { GarfexSurfaceComponent } from "./PiPresentation.ts";
import { asTui, fakeTheme, FakeTui } from "./PiPresentationTestSupport.ts";

function createSurface() {
    let closed = false;
    const tui = new FakeTui();
    const surface = new GarfexSurfaceComponent(asTui(tui), fakeTheme, () => { closed = true; });
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
