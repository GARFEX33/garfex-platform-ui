// @ts-nocheck -- Intentional process/config path strings for the architecture checker fixture.
import { spawn } from "node:child_process";

spawn("../garfex-platform/apps/backend/start.mjs");
export const resourceMasterConfig = "resource-master/internals/config.json";
