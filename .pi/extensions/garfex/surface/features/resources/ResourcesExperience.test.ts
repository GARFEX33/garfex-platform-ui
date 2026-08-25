import assert from "node:assert/strict";
import test from "node:test";

import { ResourcesExperience } from "./ResourcesExperience.ts";

test("resources navigation keeps the exact search draft for one surface lifetime", () => {
    const resources = new ResourcesExperience();

    assert.equal(resources.project().location, "resources");
    resources.openSearch();
    resources.changeSearchDraft("  acero inoxidable  ");
    resources.cancelSearch();
    assert.equal(resources.project().location, "resources");
    assert.equal(resources.project().searchDraft, "  acero inoxidable  ");
    resources.openSearch();
    assert.equal(resources.project().searchDraft, "  acero inoxidable  ");
});

test("cancel is navigation only and return home is an effect, never a screen", () => {
    const resources = new ResourcesExperience();
    resources.openSearch();
    resources.changeSearchDraft("");

    const cancelled = resources.cancelSearch();
    assert.deepEqual(cancelled.effects, []);
    assert.equal(cancelled.projection.location, "resources");
    assert.equal(cancelled.projection.searchDraft, "");

    const returned = resources.returnHome();
    assert.deepEqual(returned.effects, [{ kind: "return-home" }]);
    assert.equal(returned.projection.location, "resources");
});

test("whitespace is preserved without search execution or business meaning", () => {
    const resources = new ResourcesExperience();
    resources.openSearch();
    const transition = resources.changeSearchDraft("   ");

    assert.equal(transition.projection.searchDraft, "   ");
    assert.equal(transition.projection.availability, "search-unavailable");
    assert.deepEqual(transition.effects, []);
    assert.equal("results" in transition.projection, false);
});
