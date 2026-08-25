import assert from "node:assert/strict";
import test from "node:test";

import { runGarfexCommand } from "./index.ts";

test("non-TUI command reports the limitation without opening custom UI", async () => {
    const notices: string[] = [];
    let customCalls = 0;
    const result = await runGarfexCommand({
        mode: "rpc",
        hasUI: true,
        ui: {
            notify(message: string) { notices.push(message); },
            async custom() { customCalls += 1; },
        },
    } as never);
    assert.equal(result, "tui-required");
    assert.equal(customCalls, 0);
    assert.equal(
        notices[0],
        "GARFEX solo puede abrirse en una sesión interactiva. Inicia una e inténtalo de nuevo.",
    );
    assert.doesNotMatch(notices[0], /\bTUI\b/i);
});

test("custom UI failure has one safe actionable recovery message", async () => {
    const notices: string[] = [];
    const result = await runGarfexCommand({
        mode: "tui",
        hasUI: true,
        ui: {
            notify(message: string) { notices.push(message); },
            async custom() { throw new Error("secret technical detail"); },
        },
    } as never);
    assert.equal(result, "failed");
    assert.equal(notices.length, 1);
    assert.equal(notices[0], "No se pudo abrir GARFEX. Inténtalo de nuevo.");
    assert.doesNotMatch(notices[0], /secret|technical|cierra esta vista/i);
});
