// @ts-nocheck -- Intentional escaping filesystem path for the architecture checker fixture.
import { readFile } from "node:fs/promises";

export const contents = readFile("../../../../outside-ui-source.json", "utf8");
