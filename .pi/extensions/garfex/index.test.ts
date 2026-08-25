import assert from "node:assert/strict";
import test from "node:test";

import garfexSurfaceExtension, { runGarfexCommand } from "./index.ts";

test("non-TUI command reports the limitation without opening custom UI", async () => {
    const notices: string[] = [];
    let customCalls = 0;
    const result = await runGarfexCommand({
        mode: "rpc",
        hasUI: true,
        ui: {
            notify(message: string) {
                notices.push(message);
            },
            async custom() {
                customCalls += 1;
            },
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
            notify(message: string) {
                notices.push(message);
            },
            async custom() {
                throw new Error("secret technical detail");
            },
        },
    } as never);
    assert.equal(result, "failed");
    assert.equal(notices.length, 1);
    assert.equal(notices[0], "No se pudo abrir GARFEX. Inténtalo de nuevo.");
    assert.doesNotMatch(notices[0], /secret|technical|cierra esta vista/i);
});

test("custom UI failure retains bounded technical diagnostics outside the notice", async () => {
    const notices: string[] = [];
    const diagnostics: unknown[] = [];
    const failure = new Error("distinctive technical detail");
    failure.stack = "Error: distinctive technical detail\\n    at opening seam";
    const result = await runGarfexCommand(
        {
            mode: "tui",
            hasUI: true,
            ui: {
                notify(message: string) {
                    notices.push(message);
                },
                async custom() {
                    throw failure;
                },
            },
        } as never,
        (diagnostic: unknown) => diagnostics.push(diagnostic),
    );

    assert.equal(result, "failed");
    assert.deepEqual(notices, ["No se pudo abrir GARFEX. Inténtalo de nuevo."]);
    assert.equal(diagnostics.length, 1);
    assert.deepEqual(diagnostics[0], {
        operation: "open-surface",
        name: "Error",
        message: "distinctive technical detail",
        stack: failure.stack,
    });
    assert.deepEqual(Object.keys(diagnostics[0] as object).sort(), [
        "message",
        "name",
        "operation",
        "stack",
    ]);
    assert.doesNotMatch(
        notices.join("\\n"),
        /distinctive|technical|opening seam/i,
    );
});

test("long Error message and stack diagnostics are bounded independently", async () => {
    const diagnostics: Array<Record<string, unknown>> = [];
    const longMessage = "message-detail-".repeat(80);
    const longStack = "stack-frame-detail\n".repeat(200);
    const failure = new Error(longMessage);
    failure.stack = longStack;

    const result = await runGarfexCommand(
        {
            mode: "tui",
            hasUI: true,
            ui: {
                notify() {},
                async custom() {
                    throw failure;
                },
            },
        } as never,
        (diagnostic) => diagnostics.push(diagnostic),
    );

    assert.equal(result, "failed");
    assert.equal(diagnostics.length, 1);
    assert.equal(diagnostics[0]?.message, longMessage.slice(0, 500));
    assert.equal((diagnostics[0]?.message as string).length, 500);
    assert.equal(diagnostics[0]?.stack, longStack.slice(0, 2_000));
    assert.equal((diagnostics[0]?.stack as string).length, 2_000);
});

test("an unprintable non-Error thrown value retains a bounded technical fallback", async () => {
    const notices: string[] = [];
    const diagnostics: unknown[] = [];
    const unprintable = {
        [Symbol.toPrimitive]() {
            throw new Error("coercion failed");
        },
    };

    const result = await runGarfexCommand(
        {
            mode: "tui",
            hasUI: true,
            ui: {
                notify(message: string) {
                    notices.push(message);
                },
                async custom() {
                    throw unprintable;
                },
            },
        } as never,
        (diagnostic: unknown) => diagnostics.push(diagnostic),
    );

    assert.equal(result, "failed");
    assert.deepEqual(diagnostics, [
        {
            operation: "open-surface",
            name: "NonErrorThrow",
            message: "[unprintable thrown value]",
        },
    ]);
    assert.deepEqual(notices, ["No se pudo abrir GARFEX. Inténtalo de nuevo."]);
    assert.doesNotMatch(notices.join("\n"), /coercion|unprintable|technical/i);
});

test("non-Error opening failures normalize safely and sink failures stay contained", async () => {
    const nonErrorNotices: string[] = [];
    const nonErrorDiagnostics: unknown[] = [];
    const nonErrorResult = await runGarfexCommand(
        {
            mode: "tui",
            hasUI: true,
            ui: {
                notify(message: string) {
                    nonErrorNotices.push(message);
                },
                async custom() {
                    throw "non-error technical detail";
                },
            },
        } as never,
        (diagnostic: unknown) => nonErrorDiagnostics.push(diagnostic),
    );

    assert.equal(nonErrorResult, "failed");
    assert.deepEqual(nonErrorNotices, [
        "No se pudo abrir GARFEX. Inténtalo de nuevo.",
    ]);
    assert.deepEqual(nonErrorDiagnostics, [
        {
            operation: "open-surface",
            name: "NonErrorThrow",
            message: "non-error technical detail",
        },
    ]);

    const sinkNotices: string[] = [];
    const sinkResult = await runGarfexCommand(
        {
            mode: "tui",
            hasUI: true,
            ui: {
                notify(message: string) {
                    sinkNotices.push(message);
                },
                async custom() {
                    throw new Error("sink failure detail");
                },
            },
        } as never,
        () => {
            throw new Error("diagnostic sink failed");
        },
    );

    assert.equal(sinkResult, "failed");
    assert.deepEqual(sinkNotices, [
        "No se pudo abrir GARFEX. Inténtalo de nuevo.",
    ]);
});

test("a failed opening can be retried without stale recovery state", async () => {
    const notices: string[] = [];
    const diagnostics: unknown[] = [];
    let customCalls = 0;
    const context = {
        mode: "tui",
        hasUI: true,
        ui: {
            notify(message: string) {
                notices.push(message);
            },
            async custom() {
                customCalls += 1;
                if (customCalls === 1) throw new Error("first opening detail");
            },
        },
    } as never;

    const firstResult = await runGarfexCommand(context, (diagnostic: unknown) =>
        diagnostics.push(diagnostic),
    );
    const secondResult = await runGarfexCommand(
        context,
        (diagnostic: unknown) => diagnostics.push(diagnostic),
    );

    assert.equal(firstResult, "failed");
    assert.equal(secondResult, "closed");
    assert.equal(customCalls, 2);
    assert.deepEqual(notices, ["No se pudo abrir GARFEX. Inténtalo de nuevo."]);
    assert.equal(diagnostics.length, 1);
});

test("registered command appends opening diagnostics without exposing them in the notice", async () => {
    const notices: string[] = [];
    const entries: Array<{ type: string; data: unknown }> = [];
    let commandHandler:
        | ((args: string, context: never) => Promise<void>)
        | undefined;
    garfexSurfaceExtension({
        appendEntry(type: string, data: unknown) {
            entries.push({ type, data });
        },
        registerCommand(
            _name: string,
            registration: {
                handler: (args: string, context: never) => Promise<void>;
            },
        ) {
            commandHandler = registration.handler;
        },
    } as never);

    assert.equal(typeof commandHandler, "function");
    await commandHandler!("", {
        mode: "tui",
        hasUI: true,
        ui: {
            notify(message: string) {
                notices.push(message);
            },
            async custom() {
                throw new Error("registered technical detail");
            },
        },
    } as never);

    assert.equal(entries.length, 1);
    assert.equal(entries[0]?.type, "garfex.opening-failure");
    const diagnostic = entries[0]?.data as Record<string, unknown>;
    assert.deepEqual(
        {
            operation: diagnostic.operation,
            name: diagnostic.name,
            message: diagnostic.message,
        },
        {
            operation: "open-surface",
            name: "Error",
            message: "registered technical detail",
        },
    );
    assert.match(String(diagnostic.stack), /registered technical detail/);
    assert.deepEqual(Object.keys(diagnostic).sort(), [
        "message",
        "name",
        "operation",
        "stack",
    ]);
    assert.deepEqual(notices, ["No se pudo abrir GARFEX. Inténtalo de nuevo."]);
    assert.doesNotMatch(notices.join("\\n"), /registered technical detail/i);
});
