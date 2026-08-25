# Pi UX Hardening Tasks

This replan makes the next bounded apply a two-slice delivery after the combined implementation exceeded the review budget. The implementation already completed in Work Units 1 and 2 remains checked; the unchecked work below is limited to cleanup, evidence closure, lifecycle evidence, and final verification. No implementation, commit, push, PR creation, ordinary review, Judgment Day, or publication work is part of this artifact.

## Review Workload Forecast

| Field | Value |
| ------- | ------- |
| Estimated changed lines | 525 combined implementation lines; Slice 1: 197, Slice 2: 328 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Slice 1 → Slice 2, both stacked-to-main and independently under 400 lines |
| Delivery strategy | ask-on-risk (resolved: split) |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High
delivery_strategy: ask-on-risk (resolved: split)
chain_strategy: stacked-to-main

**Remaining implementation-owned task count: 13 unchecked checklist items.**

## Authoritative incident baseline

- The interrupted combined apply produced 525 implementation changed lines across the eight design-authorized product files.
- Slice 1 is `.pi/extensions/garfex/index.ts` and `.pi/extensions/garfex/index.test.ts`, currently measured at 197 changed lines; its focused command test is 6/6 passing, with trailing-whitespace/EOF cleanup and refreshed evidence still required.
- Slice 2 is the other six design-authorized files, currently measured at 328 changed lines; its focused presentation tests are 14/15 passing, with only the bracketed-paste expected-space assertion failing. Architecture verification is passing.
- Native Pi `Input` expands the tab plus the following literal space to five spaces: actual `'  uno     dos  '`, expected `'  uno    dos  '`. This is a test-expectation mismatch, not evidence for a production behavior change.
- The full suite is currently 45/46 and `git diff --check` currently reports trailing whitespace/EOF problems in `index.test.ts`.

## Delivery and scope guardrails

- Apply Slice 1 first, then Slice 2 on top of the first slice; keep each slice at or below 400 authored changed lines.
- The two implementation slices contain exactly the eight design-authorized files listed below. `openspec/changes/pi-ux-hardening/tasks.md` and `openspec/changes/pi-ux-hardening/apply-progress.md` are SDD lifecycle artifacts, not implementation-slice product files and are excluded from slice line counts.
- Preserve the existing Spanish safe recovery copy, native `SelectList`/`Input` ownership, exact Interaction State draft behavior, truthful unavailable Search, and architecture boundaries.
- Keep strict TDD ordering for any remaining evidence work: classify RED evidence, make only a justified GREEN change, TRIANGULATE, then make a bounded REFACTOR if needed.
- Do not invent historical RED/GREEN commands while refreshing `apply-progress.md`; record only evidence available from the current tests and diff.
- A production edit is allowed only when a new assertion proves a GARFEX-owned defect. The known bracketed-paste mismatch must be corrected in the expectation, with no production change.

## Slice 1 — command recovery, stacked-to-main first slice

**Exact product boundary:**

- `.pi/extensions/garfex/index.ts`
- `.pi/extensions/garfex/index.test.ts`

**Current line evidence:** 197 implementation changed lines, under the 400-line budget.

**Start boundary:** Work Unit 1 implementation is present and its focused command test passes 6/6, but `index.test.ts` has whitespace/EOF defects and the cumulative evidence needs refreshing.

**Finish boundary:** The two-file slice has clean whitespace/EOF, refreshed 6/6 command-recovery evidence, a recorded 197-line-or-final-recount receipt under 400, and a rollback that removes only diagnostic retention and its paired tests while preserving safe Spanish recovery.

**Rollback boundary:** Revert only `.pi/extensions/garfex/index.ts` and `.pi/extensions/garfex/index.test.ts`; do not touch the presentation slice, Resources feature, architecture checker, or SDD lifecycle artifacts.

### Preserved Work Unit 1 implementation evidence

- [x] Add focused failing tests first in `.pi/extensions/garfex/index.test.ts` for an `Error` with distinctive message and stack, asserting exactly one safe Spanish notification, no thrown detail or stack in any primary notice, and one diagnostic containing only the allowed operation/name/message/stack fields. <!-- sdd-owner: implementation -->
- [x] Add focused failing cases in `.pi/extensions/garfex/index.test.ts` for a non-`Error` throw, a diagnostic sink that throws, and two invocations where opening throws on call one and succeeds on call two; require safe normalization, one notification, a returned `"failed"` then `"closed"`, and no stale diagnostic or recovery notice on the successful retry. <!-- sdd-owner: implementation -->
- [x] Run `node --test .pi/extensions/garfex/index.test.ts` and record that the new assertions fail for the missing diagnostic path rather than because of a malformed harness; keep the RED checkbox unchecked until that failure evidence is captured. <!-- sdd-owner: implementation -->
- [x] Implement the smallest command-boundary change in `.pi/extensions/garfex/index.ts`: catch `unknown`, retain the existing `reportSafeFailure(context)` exactly once, accept a narrow optional diagnostic callback for tests, normalize `Error` and bounded non-Error values, attempt one diagnostic after notification, suppress only sink failure, and preserve `"failed"/"closed"` results. <!-- sdd-owner: implementation -->
- [x] Wire the default extension registration in `.pi/extensions/garfex/index.ts` to `pi.appendEntry("garfex.opening-failure", data)` with `operation: "open-surface"`; exclude arguments, draft, prompt, cwd, environment, session content, and all user input from the record, and use no console, process-stream, visible-message, or global-hook fallback. <!-- sdd-owner: implementation -->
- [x] Re-run `node --test .pi/extensions/garfex/index.test.ts` and verify the exact diagnostic fields, one-notice/non-leakage invariant, sink-failure containment, non-Error normalization, and clean failed-open-then-successful-retry behavior while the existing tests remain intact. <!-- sdd-owner: implementation -->
- [x] Refactor only local names or normalization helpers in `.pi/extensions/garfex/index.ts` and `.pi/extensions/garfex/index.test.ts` after GREEN evidence, keeping the recovery boundary single, the callback narrow, and the rollback file-local; rerun the focused command test before marking complete. <!-- sdd-owner: implementation -->

### Remaining Slice 1 closeout

- [x] Remove trailing whitespace and repair the final newline/EOF in `.pi/extensions/garfex/index.test.ts` without changing behavior; verify the focused command test still exercises the existing six passing cases. <!-- sdd-owner: implementation -->
- [x] Run `node --test .pi/extensions/garfex/index.test.ts` after cleanup and refresh the Slice 1 evidence with the exact 6/6 result, one safe notification, retained diagnostic fields, sink containment, non-Error normalization, and clean retry behavior. <!-- sdd-owner: implementation -->
- [x] Record the Slice 1 receipt from the final diff: exactly the two boundary files, 197 changed lines or an explicit final recount still below 400, focused-test result, no out-of-scope file, and the file-local rollback boundary stated above. <!-- sdd-owner: implementation -->

## Slice 2 — Pi presentation and evidence, stacked-to-main second slice

**Exact product boundary:**

- `.pi/extensions/garfex/composition/createPiSurface.ts`
- `.pi/extensions/garfex/hosts/pi/PiPresentation.ts`
- `.pi/extensions/garfex/hosts/pi/PiResourcesPresentation.ts`
- `.pi/extensions/garfex/hosts/pi/PiPresentationTestSupport.ts`
- `.pi/extensions/garfex/hosts/pi/PiPresentation.test.ts`
- `.pi/extensions/garfex/hosts/pi/PiResourcesPresentation.test.ts`

**Current line evidence:** 328 implementation changed lines, under the 400-line budget.

**Dependency:** Apply after Slice 1's cleanup and refreshed command evidence; Slice 2 must not absorb command-recovery files.

**Start boundary:** Work Unit 2 implementation is checked and read-only verification shows 14/15 focused presentation tests passing, with the single known paste-expectation mismatch.

**Finish boundary:** Configuration-aware help, native cancel routing, active-state cues, exact interaction evidence, honest availability, width safety, and architecture boundaries are triangulated at 15/15 focused presentation tests; the six-file receipt remains under 400 and rolls back independently.

**Rollback boundary:** Revert only the six files listed above and their presentation/evidence behavior; retain Slice 1 diagnostics, native components, existing navigation foundations, Resources state, and architecture tooling.

### Preserved Work Unit 2 implementation evidence

- [x] Add real-manager RED fixtures in `.pi/extensions/garfex/hosts/pi/PiPresentationTestSupport.ts` and focused tests in `.pi/extensions/garfex/hosts/pi/PiPresentation.test.ts` using an actual Pi 0.84.2 `KeybindingsManager` plus the matching TUI registry, remapping `tui.select.up/down/confirm/cancel` to representative non-default bindings; assert rendered Spanish help uses active labels and omits inactive arrow/Enter/Escape defaults. <!-- sdd-owner: implementation -->
- [x] Add RED assertions in `.pi/extensions/garfex/hosts/pi/PiPresentation.test.ts` for the selected native row containing `Activa:` before and after native movement, Search containing `Campo activo:` while `CURSOR_MARKER` and native Input focus remain, and remapped cancel following Search → Resources → Home → close; after remapping, raw Escape must not navigate as an independent active binding. <!-- sdd-owner: implementation -->
- [x] Update only directly affected expectations in `.pi/extensions/garfex/hosts/pi/PiResourcesPresentation.test.ts` while preserving its honest-unavailability, useful-affordance, and product-language assertions; run the focused presentation command and capture RED failures attributable to hard-coded guidance, missing cues, or raw-cancel handling. <!-- sdd-owner: implementation -->
- [x] Change `.pi/extensions/garfex/composition/createPiSurface.ts` to pass the callback-injected `KeybindingsManager` into the existing `GarfexSurfaceComponent` without introducing a host port or another composition layer. <!-- sdd-owner: implementation -->
- [x] In `.pi/extensions/garfex/hosts/pi/PiPresentation.ts`, retain the manager, route cancel before delegation through `keybindings.matches(data, "tui.select.cancel")`, and let native SelectList/Input continue to own movement, confirmation, editing, cursor, paste, and focus behavior. <!-- sdd-owner: implementation -->
- [x] Replace physical-key strings with a local presentation helper using Pi `keyText()`/`keyHint()` and semantic Spanish descriptions in `.pi/extensions/garfex/hosts/pi/PiPresentation.ts` and `.pi/extensions/garfex/hosts/pi/PiResourcesPresentation.ts`; omit unbound fragments instead of falling back to inactive defaults, and never advertise Search execution. <!-- sdd-owner: implementation -->
- [x] Add the additive cues in `.pi/extensions/garfex/hosts/pi/PiPresentation.ts`: derive `Activa:` solely from native `truncatePrimary({ isSelected })`, add static `Campo activo: borrador de búsqueda` beside the retained native Input, and do not copy selected index, selected value, draft, or cursor into new GARFEX state. <!-- sdd-owner: implementation -->
- [x] Run `node --test .pi/extensions/garfex/hosts/pi/PiPresentation.test.ts .pi/extensions/garfex/hosts/pi/PiResourcesPresentation.test.ts` and verify real remapped labels, omission of inactive defaults, selected/focused textual cues, remapped cancel hierarchy, native Input cursor/focus markers, honest availability, and Spanish copy. <!-- sdd-owner: implementation -->
- [x] Refactor only duplicated local hint joining or test-fixture setup in `.pi/extensions/garfex/hosts/pi/PiPresentation.ts`, `.pi/extensions/garfex/hosts/pi/PiResourcesPresentation.ts`, `.pi/extensions/garfex/hosts/pi/PiPresentationTestSupport.ts`, and their focused test files after the focused tests pass; preserve native ownership, final width truncation, semantic back outcomes, and the absence of a generic keybinding adapter, then rerun both focused presentation test files. <!-- sdd-owner: implementation -->

### Remaining Work Unit 3 evidence closure — RED → GREEN (conditional) → TRIANGULATE → REFACTOR

- [x] Run the current focused presentation evidence for combining Unicode, long exact drafts, whitespace/paste-equivalent input, and repeated resize/navigation at widths 60, 20, 8, and 1; classify every result as preserved behavior or a genuine GARFEX-owned RED, recording the exact failing assertion when one exists rather than inventing historical RED commands. <!-- sdd-owner: implementation -->
- [x] Correct the sole bracketed-paste expectation in `.pi/extensions/garfex/hosts/pi/PiPresentation.test.ts` from four to five spaces so it matches native Input's observed `'  uno     dos  '` expansion; make no production edit for this mismatch, and investigate a production change only if a separate new GARFEX-owned RED is proven. <!-- sdd-owner: implementation -->
- [x] Complete the evidence-only interaction coverage in `.pi/extensions/garfex/hosts/pi/PiPresentation.test.ts`: assert exact combining code points and cursor/focus retention, full long-draft retention with in-bounds rendered lines, exact whitespace with no execution/error side effect, and continued back/cancel navigation through repeated resizes; add or adjust only missing GARFEX-owned assertions and do not edit `.pi/extensions/garfex/surface/features/resources/` unless a new RED proves feature ownership. <!-- sdd-owner: implementation -->
- [x] Run `node --test .pi/extensions/garfex/hosts/pi/PiPresentation.test.ts .pi/extensions/garfex/hosts/pi/PiResourcesPresentation.test.ts` and require 15/15 focused tests, including remapped labels, inactive-default omission, textual cues, remapped cancel hierarchy, native cursor/focus, exact draft evidence, narrow-width bounds, honest availability, and Spanish copy. <!-- sdd-owner: implementation -->
- [x] After the evidence suite is green, consolidate only genuinely duplicated local test helpers or width loops in the six Slice 2 files; if no bounded refactor is needed, record that no behavior-changing refactor was made and rerun the focused presentation command. <!-- sdd-owner: implementation -->
- [x] Record the Slice 2 receipt from the final diff: exactly the six boundary files, 328 changed lines or an explicit final recount still below 400, 15/15 focused presentation tests, architecture result, no feature-layer or out-of-scope file, and the independent rollback boundary stated above. <!-- sdd-owner: implementation -->

## Lifecycle evidence and final verification

- [x] Refresh `openspec/changes/pi-ux-hardening/apply-progress.md` as an SDD lifecycle artifact, preserving the recorded Work Unit 1 evidence and adding only the Work Unit 2 evidence available from the current focused 14/15 result, current diff, and architecture observation; record the known paste expectation mismatch, whitespace/EOF defect, both slice receipts, and remaining status without inventing historical RED/GREEN commands. <!-- sdd-owner: implementation -->
- [x] Run `npm test` after both slices are clean and require the complete native suite to pass at 46/46, recording the exact result and any explicitly unexecuted check. <!-- sdd-owner: implementation -->
- [x] Run `npm run check:architecture` and `git diff --check`; require the existing architecture checker to pass without expansion and require a whitespace/EOF-clean diff. <!-- sdd-owner: implementation -->
- [x] Verify the final acceptance and scope receipt: the eight product files remain partitioned exactly as Slice 1 and Slice 2, each slice is under 400 changed lines, OpenSpec lifecycle artifacts are excluded from product counts, rollback boundaries are independently usable, and no new host, port, capability, business state, remote dependency, ADR, architecture infrastructure, or production behavior was introduced. <!-- sdd-owner: implementation -->

Stacked-to-main defines only the two review boundaries above. Publication and ordinary review lifecycle actions remain out of scope unless explicitly requested later.
