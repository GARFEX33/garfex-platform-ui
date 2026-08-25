import assert from "node:assert/strict";
import test from "node:test";

import { GARFEX_HOME_ITEMS } from "./PiMainMenu.ts";
import { resourcesView } from "./PiResourcesPresentation.ts";

const unavailable = {
    location: "search" as const,
    searchDraft: "pieza",
    availability: "search-unavailable" as const,
};

test("search presentation is honest, actionable, and free of execution claims", () => {
    const view = resourcesView(unavailable);
    assert.match(view.description, /no está disponible/i);
    assert.match(view.description, /conserva/i);
    assert.doesNotMatch(view.description, /resultado|completad|ejecutad/i);
    assert.match(view.hint, /Esc/);
});

test("resource menu exposes only useful honest affordances", () => {
    const view = resourcesView({ ...unavailable, location: "resources" });
    assert.deepEqual(
        view.items.map(({ value }) => value),
        ["search", "back"],
    );
    assert.doesNotMatch(
        JSON.stringify(view),
        /proveedor|configuración|crear|explorar/i,
    );
});

test("menu and projections use product language without internal implementation wording", () => {
    const copy = JSON.stringify([
        GARFEX_HOME_ITEMS,
        resourcesView(unavailable),
        resourcesView({ ...unavailable, location: "resources" }),
    ]);

    assert.doesNotMatch(
        copy,
        /sin inventar datos|datos simulados|conexión de búsqueda|ejecut|solicitud/i,
    );
});
