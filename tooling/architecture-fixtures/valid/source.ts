// @ts-nocheck -- Fixture proves ordinary external packages are architecture-valid without installing them.
import leftPad from "left-pad";
import { localValue } from "./local.js";

export const value = leftPad(String(localValue), 2);
// Documentation examples such as spawn("../garfex-platform/start.mjs") are not executable coupling.
export const productLabel = "GARFEX Platform";
export const localConfigPath = "./config/local.json";
