import type {
    ExtensionAPI,
    ExtensionCommandContext,
} from "@earendil-works/pi-coding-agent";

import { openPiSurface } from "./composition/createPiSurface.ts";
import {
    reportSafeFailure,
    reportTuiRequired,
    type GarfexCommandResult,
} from "./hosts/pi/PiRuntime.ts";

export type OpeningFailureDiagnostic = Readonly<{
    operation: "open-surface";
    name: string;
    message: string;
    stack?: string;
}>;

type OpeningFailureSink = (diagnostic: OpeningFailureDiagnostic) => void;

const MAX_OPENING_FAILURE_NAME_LENGTH = 100;
const MAX_OPENING_FAILURE_MESSAGE_LENGTH = 500;
const MAX_OPENING_FAILURE_STACK_LENGTH = 2_000;
const UNPRINTABLE_THROWN_VALUE = "[unprintable thrown value]";

function boundedThrownValue(value: unknown): string {
    try {
        return String(value).slice(0, MAX_OPENING_FAILURE_MESSAGE_LENGTH);
    } catch {
        return UNPRINTABLE_THROWN_VALUE;
    }
}

function normalizeOpeningFailure(error: unknown): OpeningFailureDiagnostic {
    if (error instanceof Error) {
        return {
            operation: "open-surface",
            name: error.name.slice(0, MAX_OPENING_FAILURE_NAME_LENGTH),
            message: error.message.slice(0, MAX_OPENING_FAILURE_MESSAGE_LENGTH),
            ...(error.stack === undefined
                ? {}
                : {
                      stack: error.stack.slice(
                          0,
                          MAX_OPENING_FAILURE_STACK_LENGTH,
                      ),
                  }),
        };
    }

    return {
        operation: "open-surface",
        name: "NonErrorThrow",
        message: boundedThrownValue(error),
    };
}

export async function runGarfexCommand(
    context: ExtensionCommandContext,
    openingFailureSink?: OpeningFailureSink,
): Promise<GarfexCommandResult> {
    if (context.mode !== "tui") {
        reportTuiRequired(context);
        return "tui-required";
    }

    try {
        await openPiSurface(context);
        return "closed";
    } catch (error: unknown) {
        reportSafeFailure(context);
        if (openingFailureSink) {
            try {
                openingFailureSink(normalizeOpeningFailure(error));
            } catch {
                // Diagnostic retention is best effort after safe recovery.
            }
        }
        return "failed";
    }
}

export default function garfexSurfaceExtension(pi: ExtensionAPI): void {
    pi.registerCommand("garfex", {
        description: "Abrir GARFEX",
        handler: async (_args, context) => {
            await runGarfexCommand(context, (diagnostic) => {
                pi.appendEntry("garfex.opening-failure", diagnostic);
            });
        },
    });
}
