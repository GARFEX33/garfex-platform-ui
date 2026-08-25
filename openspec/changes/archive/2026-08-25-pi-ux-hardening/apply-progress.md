# Apply Progress — `pi-ux-hardening`

## Status consumed and produced

- Native status was consumed before implementation with `gentle-ai sdd-status pi-ux-hardening --cwd /home/garfex/PROGRAMACION/garfex-platform-ui --json --instructions`.
- Initial authoritative status: `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`, and `taskProgress: 16/29`; proposal, spec, design, tasks, and prior apply progress were present.
- Active change: `pi-ux-hardening`.
- Planning home: `/home/garfex/PROGRAMACION/garfex-platform-ui/openspec`.
- Change root: `/home/garfex/PROGRAMACION/garfex-platform-ui/openspec/changes/pi-ux-hardening`.
- Action context: `mode: repo-local`; workspace root and allowed edit root are `/home/garfex/PROGRAMACION/garfex-platform-ui`; no action-context or edit-root warning was present.
- Native attempt authority was authenticated for work unit `closeout-stacked-slices`: acquire returned `state: proceed` with the parent-owned token and request id `sdd-apply-closeout-stacked-slices-1787682438-4170423`. The parent retains and will settle that token; this phase did not settle it.
- Final phase outcome after checkbox reconciliation: all implementation tasks are complete; verification, review receipt, publication, and other parent lifecycle actions remain outside this executor boundary. The phase recommendation is `parent-lifecycle`.

### Workload and delivery gate

- `Decision needed before apply: No`.
- `Chained PRs recommended: Yes`.
- `Chain strategy: stacked-to-main`.
- `400-line budget risk: High`.
- Delivery decision was resolved by the parent as `delivery_strategy: ask-on-risk (resolved: split)` with two independently reviewable stacked slices. Only the assigned closeout work unit was applied; no commit, push, PR, review actor, or publication was started.

### Artifact and task status

- Proposal: present and read.
- Spec: present and read.
- Design: present and read.
- Tasks: present and read; ownership markers were checked and all checkbox rows selected for this phase were terminal `<!-- sdd-owner: implementation -->` markers.
- Apply progress: cumulatively refreshed in this file.
- Parent-owned task rows: none.
- Initial implementation progress: 16/29 complete.
- Final implementation progress: 29/29 complete.
- Unchecked implementation lines at closeout: none.
- `verify` and `archive` remain parent-lifecycle states because this executor neither starts review/verification actors nor creates or approves receipts.

## Preserved Work Unit 1 history

The following evidence was already recorded in the preserved partial apply and is retained without inventing new historical commands:

- Baseline focused command before Work Unit 1 edits: `node --test .pi/extensions/garfex/index.test.ts .pi/extensions/garfex/hosts/pi/PiPresentation.test.ts .pi/extensions/garfex/hosts/pi/PiResourcesPresentation.test.ts` — 10 passed, 0 failed.
- Existing repository baseline supplied by the earlier apply: 35 passing tests.
- Work Unit 1 RED command: `node --test .pi/extensions/garfex/index.test.ts` — 2 passed, 3 failed because the missing diagnostic path was not implemented; the harness still opened and reported the safe failure correctly.
- Work Unit 1 GREEN command: `node --test .pi/extensions/garfex/index.test.ts` — 6 passed, 0 failed after the narrow diagnostic callback, normalization, sink containment, and registration wiring.
- Work Unit 1 TRIANGULATE command: the same focused command — 6 passed, 0 failed across Error, non-Error, sink-failure, registration, and retry cases.
- Work Unit 1 REFACTOR command: the same focused command — 6 passed, 0 failed; no behavior-changing refactor was needed in the recovery boundary.
- The preserved Work Unit 1 implementation remains limited to `.pi/extensions/garfex/index.ts` and `.pi/extensions/garfex/index.test.ts`; the diagnostic record contains only operation/name/message/optional stack.

## Closeout evidence and task completion

### Slice 1 — command recovery, stacked-to-main first slice

Completed implementation-owned tasks 17–19 and updated each persisted checkbox immediately after its evidence passed:

- Removed the trailing-whitespace-only line and repaired the final newline/EOF in `.pi/extensions/garfex/index.test.ts`; behavior was unchanged.
- Re-ran `node --test .pi/extensions/garfex/index.test.ts` after cleanup: **6 tests, 6 passed, 0 failed**. The suite covers one safe Spanish notification, diagnostic Error fields and non-leakage, non-Error normalization, throwing-sink containment, and a clean failed-open-then-successful-retry.
- Final Slice 1 product diff receipt:
  - `.pi/extensions/garfex/index.test.ts`: 153 additions, 1 deletion.
  - `.pi/extensions/garfex/index.ts`: 40 additions, 2 deletions.
  - Total: **193 additions + 3 deletions = 196 changed lines**, explicitly below 400.
  - Exact product paths: `.pi/extensions/garfex/index.ts`, `.pi/extensions/garfex/index.test.ts`.
  - Rollback boundary: revert only those two files; this removes diagnostic retention and paired tests while preserving safe Spanish recovery, TUI gating, the presentation slice, Resources state, and architecture tooling.

### Slice 2 — Pi presentation and evidence, stacked-to-main second slice

The preserved partial work had already checked Work Unit 2 tasks 8–16. The available closeout evidence was refreshed without claiming unavailable historical commands:

- The current focused presentation command before the expected-value correction was run: `node --test .pi/extensions/garfex/hosts/pi/PiPresentation.test.ts .pi/extensions/garfex/hosts/pi/PiResourcesPresentation.test.ts` — **15 tests, 14 passed, 1 failed**.
- The sole failure was the known bracketed-paste expectation at `PiPresentation.test.ts:144`: native Pi `Input` produced `'  uno     dos  '` while the test expected `'  uno    dos  '`. This was an expectation mismatch, not a production RED; no feature-layer or production behavior change was made for it.
- The same run classified the remaining evidence as preserved behavior: combining Unicode and insertion position passed; long exact draft retention and narrow rendered-line bounds passed; repeated navigation and resize at widths 60, 20, 8, and 1 passed; remapped help, inactive-default omission, textual cues, remapped cancel, honest availability, native focus/cursor, and Spanish copy passed.
- Corrected only the bracketed-paste expected value to five spaces and then re-ran the focused command: **15 tests, 15 passed, 0 failed**.
- Evidence-only interaction coverage was already present at the GARFEX-owned seam and was verified green: exact combining code points and insertion position after reopen, cursor/focus marker retention, full long-draft retention, in-bounds rendering, exact whitespace without execution/close side effects, and continued back/cancel navigation through repeated resizes.
- After the evidence suite was green, the bounded test-fixture refactor aligned the fixture with pinned Pi 0.84.2 seams: the coding-agent `KeybindingsManager` value is used for the component contract, a root TUI manager with the same user configuration serves root native components, duplicate type/value names were removed, and no diagnostic suppression or generic port was added. The focused presentation command remained **15/15** after the refactor.
- Final Slice 2 product diff receipt:
  - `.pi/extensions/garfex/composition/createPiSurface.ts`: 2 additions, 2 deletions.
  - `.pi/extensions/garfex/hosts/pi/PiPresentation.test.ts`: 154 additions, 4 deletions.
  - `.pi/extensions/garfex/hosts/pi/PiPresentation.ts`: 89 additions, 11 deletions.
  - `.pi/extensions/garfex/hosts/pi/PiPresentationTestSupport.ts`: 34 additions, 2 deletions.
  - `.pi/extensions/garfex/hosts/pi/PiResourcesPresentation.test.ts`: 11 additions, 1 deletion.
  - `.pi/extensions/garfex/hosts/pi/PiResourcesPresentation.ts`: 25 additions, 3 deletions.
  - Total: **315 additions + 23 deletions = 338 changed lines**, explicitly below 400.
  - Exact product paths are those six files only.
  - Rollback boundary: revert only those six files; this removes configuration-aware presentation and its evidence while retaining Slice 1 diagnostics, native components, navigation foundations, Resources state, and architecture tooling.

## Persisted task checkbox updates

- Tasks 1–7 (Work Unit 1) were already persisted as `[x]` in the preserved partial work and their historical evidence is retained above.
- Tasks 8–16 (Work Unit 2) were already persisted as `[x]` in the corrected tasks artifact; the current 14/15 observation, known mismatch, architecture result, and final 15/15 evidence are recorded above.
- Tasks 17–19 (Slice 1 closeout) were changed from `- [ ]` to `- [x]` in `openspec/changes/pi-ux-hardening/tasks.md` immediately after cleanup, focused evidence, and the final Slice 1 receipt.
- Tasks 20–25 (Slice 2 evidence closure and receipt) were changed from `- [ ]` to `- [x]` immediately after classification, the expectation-only correction, 15/15 evidence, bounded fixture refactor, and final Slice 2 receipt.
- Tasks 27–29 (final verification and scope receipt) were changed from `- [ ]` to `- [x]` immediately after the final commands and scope audit.
- Task 26 is the lifecycle-artifact refresh represented by this cumulative file and is reconciled with the persisted checkbox immediately after this write.

## Strict TDD cycle evidence

Strict TDD was active with `npm test`; the global guidance at `/home/garfex/.pi/agent/gentle-ai/support/strict-tdd.md` was read. No project-local override exists, and `openspec/config.yaml` declares no standalone compiler, linter, formatter, or build command.

| Task slice | Test file / layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- |
| Preserved Work Unit 1 diagnostic retention | `.pi/extensions/garfex/index.test.ts` / command boundary | 10/10 combined focused pass recorded in prior apply | 3 expected missing-diagnostic failures recorded in prior apply | 6/6 focused pass recorded in prior apply | 6/6 Error, non-Error, sink, registration, and retry cases | 6/6; no behavior-changing refactor needed |
| Slice 1 closeout cleanup | `.pi/extensions/garfex/index.test.ts` / command boundary | 6/6 before cleanup | Existing RED evidence was already captured; cleanup was whitespace/EOF-only and introduced no production behavior | 6/6 after cleanup | Existing six cases continued to cover distinct recovery paths | No behavior-changing refactor |
| Preserved Work Unit 2 presentation behavior | `PiPresentation.test.ts` and `PiResourcesPresentation.test.ts` / presentation boundary | Current 14/15 before the expectation correction | One exact known expectation RED: actual `'  uno     dos  '` versus expected `'  uno    dos  '`; all other evidence cases passed | Expectation-only correction produced 15/15; no production edit was justified | Remapping, cues, cancel hierarchy, Unicode, long draft, whitespace, resize, availability, and Spanish-copy cases all passed | Fixture seam was aligned to actual pinned Pi managers; focused suite remained 15/15 |
| Final verification | `npm test` / repository native suite | 45/46 before the known expectation correction | Same single bracketed-paste expectation failure | 46/46 after the correction | Focused commands and architecture check independently passed | No further behavior-changing refactor |

## Final verification commands

- `node --test .pi/extensions/garfex/index.test.ts` — **6/6 passed**.
- `node --test .pi/extensions/garfex/hosts/pi/PiPresentation.test.ts .pi/extensions/garfex/hosts/pi/PiResourcesPresentation.test.ts` — **15/15 passed**.
- `npm test` — **46/46 passed**.
- `npm run check:architecture` — **passed**; no architecture checker expansion was made.
- `git diff --check` — **passed** with no whitespace or EOF diagnostics.
- Direct Node-native TypeScript imports exercised the changed command, composition, presentation, test-support, and Resources presentation seams. The repository has no selected compiler or standalone LSP command, so no compiler baseline or diagnostic suppression was added. No known residual runtime or focused-test diagnostic remains.

## Scope and acceptance receipt

- The eight product files remain partitioned exactly as requested:
  - Slice 1: `.pi/extensions/garfex/index.ts`, `.pi/extensions/garfex/index.test.ts` — **196 changed lines**.
  - Slice 2: `.pi/extensions/garfex/composition/createPiSurface.ts`, `.pi/extensions/garfex/hosts/pi/PiPresentation.ts`, `.pi/extensions/garfex/hosts/pi/PiResourcesPresentation.ts`, `.pi/extensions/garfex/hosts/pi/PiPresentationTestSupport.ts`, `.pi/extensions/garfex/hosts/pi/PiPresentation.test.ts`, `.pi/extensions/garfex/hosts/pi/PiResourcesPresentation.test.ts` — **338 changed lines**.
- Both conceptual slices are independently below the 400-line review budget. OpenSpec lifecycle artifacts are excluded from those product counts.
- The only lifecycle artifacts written by this phase are `openspec/changes/pi-ux-hardening/tasks.md` and this `apply-progress.md`. The other untracked OpenSpec planning inputs were read-only context.
- `git diff --name-only` for tracked changes contains exactly the eight allowed product paths. No feature-layer, docs, ADR, architecture checker, package, lockfile, host, port, capability, business-state, remote-dependency, or other out-of-scope product path was changed.
- No new host, generic UI/host port, parallel visual framework, backend/network dependency, business capability, authentication/permission model, ADR, or architecture infrastructure was introduced.
- The independent rollback boundaries are file-local to each stacked slice and do not overlap unrelated Resources feature state or repository tooling.
- No known conflict remains in the two-slice product diff.

## Deviations

- The final line counts differ from the corrected tasks artifact's preserved starting estimates because the final receipt uses the actual `git diff --numstat` after whitespace cleanup and diagnostic seam alignment: Slice 1 is 196 changed lines and Slice 2 is 338 changed lines. Both remain under budget.
- The bracketed-paste failure was corrected only in the test expectation from four to five spaces, exactly as authorized; no production change was made for native Pi `Input` expansion.
- The test-support refactor uses the pinned Pi 0.84.2 coding-agent manager and matching TUI registries to remove the duplicate import/type seam and keep native root components configured. Runtime behavior and focused tests remain unchanged.

## Remaining tasks and lifecycle boundary

- No unchecked implementation-owned task lines remain in `openspec/changes/pi-ux-hardening/tasks.md`.
- No parent-owned task lines are present.
- This executor returns `parent-lifecycle`; it does not start bounded review, refutation, correction, validation actors, receipt creation/approval, or delivery gates.

## Corrective quality-gate revalidation

- A cached session diagnostic initially reported that `createPiSurface.ts` passed four arguments to a three-argument `GarfexSurfaceComponent` constructor.
- Fresh source inspection showed the constructor has four parameters at `PiPresentation.ts:77-82`, the composition call passes four arguments at `createPiSurface.ts:9-10`, and Pi's `custom()` callback supplies `tui`, `theme`, `keybindings`, and `done`.
- Fresh primary LSP diagnostics across the six changed command/composition/presentation seams returned zero errors, disproving the cached warning without a production or test change.
- Corrective revalidation remained green: command tests 6/6, presentation tests 15/15, full suite 46/46, architecture check passed, and `git diff --check` passed.
- This lifecycle evidence update is the only correction-candidate change; no source change was justified by the stale diagnostic.

## Engram mirror

Significant closeout results are mirrored separately to Engram topic `sdd/pi-ux-hardening/apply` after this artifact write. The OpenSpec artifact remains authoritative for this phase.

## Bounded strict-TDD evidence remediation

### Structured status and binding consumed

- This was one bounded evidence remediation, not an implementation reapply. Native status was consumed before the runtime work: `changeName: pi-ux-hardening`, `artifactStore: openspec`, `applyState: all_done`, `taskProgress: 29/29`, `nextRecommended: remediate`, `verify: blocked`, and `remediationState.required: true`.
- Action context remained safe and unchanged: `mode: repo-local`, workspace root `/home/garfex/PROGRAMACION/garfex-platform-ui`, and the repository root was the allowed edit root. No workspace-planning warning was present.
- The workload guard was re-read before this remediation: `Decision needed before apply: No`, `Chained PRs recommended: Yes`, `Chain strategy: stacked-to-main`, and `400-line budget risk: High`. The parent-resolved delivery path remains the two stacked slices; this remediation touched only Work Unit 2 evidence and did not reopen implementation work.
- The active parent-owned native attempt was authenticated with the existing proceed token and remained unsettled by this executor. The remediation is bound to failed verification evidence revision `sha256:f9c342bc4e5089018166386559d0af754cd8ffdf3e4a832a29cde35d81cea390`; the parent retains the token and must settle it.
- No task checkbox, `tasks.md`, `verify-report.md`, product test, or product source was edited by this remediation. The only persistent edit surface used was this `apply-progress.md` file.

### Green baseline and saved production patch

- Baseline focused command: `node --test .pi/extensions/garfex/hosts/pi/PiPresentation.test.ts .pi/extensions/garfex/hosts/pi/PiResourcesPresentation.test.ts` — **15 tests, 15 passed, 0 failed**.
- The temporary binary patch was created from the current diff with `git diff --binary --no-ext-diff` and contained exactly these three Work Unit 2 production files, with no tests, test support, Slice 1, OpenSpec, or unrelated path:
  - `.pi/extensions/garfex/composition/createPiSurface.ts` — 2 additions, 2 deletions.
  - `.pi/extensions/garfex/hosts/pi/PiPresentation.ts` — 89 additions, 11 deletions.
  - `.pi/extensions/garfex/hosts/pi/PiResourcesPresentation.ts` — 25 additions, 3 deletions.
- Pre-remediation SHA-256 hashes were captured before reversal:

  | Production file | Pre-remediation SHA-256 |
  | --- | --- |
  | `.pi/extensions/garfex/composition/createPiSurface.ts` | `18eb3687e3311fcd7106e4a956e48df4a8f0eaed947e1cb8813ba800adb09169` |
  | `.pi/extensions/garfex/hosts/pi/PiPresentation.ts` | `5e15418f5d5e6b3f84641e19bb686698caa173b7c037ebeea70fb5b6fa79d7e3` |
  | `.pi/extensions/garfex/hosts/pi/PiResourcesPresentation.ts` | `85b7d08089071c32c070707af9472ea20784dc72e0cd8e8ffaac48da3e66d09f` |

### Genuine reproduced RED

- `git apply --reverse --check` passed, and the exact saved production patch was reverse-applied. The focused command then ran normally: imports succeeded, 9 tests passed, 6 failed, and the process exited with status 1. No malformed harness or import crash occurred.
- The exact failing output was:

  | Test location and name | Exact failure |
  | --- | --- |
  | `PiPresentation.test.ts:56`, `escape follows Search -> Resources -> GARFEX -> close` | `TypeError: this.done is not a function` at baseline `PiPresentation.ts:124:18`, from `handleInput` at `PiPresentation.ts:88:18` and the final Escape assertion at `PiPresentation.test.ts:68:13`. This is recorded as the secondary baseline constructor/callback incompatibility exposed by the reversed production contract, not used as the sole behavior evidence. |
  | `PiPresentation.test.ts:181`, `remapped Pi bindings drive Spanish help without inactive defaults` | `AssertionError`: `assert.ok(rendered.includes("alt+k"))`; actual `false`, expected `true`. |
  | `PiPresentation.test.ts:194`, `native selection and Search expose additive textual active cues` | `AssertionError`: `assert.ok(firstHomeRender.includes("Activa: Recursos maestros"))`; actual `false`, expected `true`. |
  | `PiPresentation.test.ts:211`, `remapped cancel follows the hierarchy and raw Escape is not an active binding` | Strict equality mismatch: actual location `resources`, expected `search` after the remapped cancel input. |
  | `PiResourcesPresentation.test.ts:13`, `search presentation is honest, actionable, and free of execution claims` | Deep equality mismatch: actual hint was `Escribe para preparar el borrador · Esc: volver a Recursos`; expected `{ kind: "search", typing: "Escribe para preparar el borrador", cancel: "volver a Recursos" }`. |
  | `PiResourcesPresentation.test.ts:25`, `resource menu exposes only useful honest affordances` | Deep equality mismatch: actual hint was `↑/↓: mover · Enter: elegir · Esc: volver a GARFEX`; expected `{ kind: "menu", movement: "mover", confirm: "elegir", cancel: "volver a GARFEX" }`. |

- The five direct assertion failures prove the missing configuration-aware guidance, remapped cancel routing, additive active cue, and semantic hint projection. The secondary `this.done` runtime failure is retained honestly as part of the same reversed baseline run; it was not substituted for those direct assertions.

### Restoration and identity proof

- The production patch was reapplied immediately after the RED command without changing any test or support file. Reverse-state baseline hashes were `c022d767a674b37d8da4c78e430c742c33a557f07641d3b93cdccc2eb7a856ae` for `createPiSurface.ts`, `cbece9aeadef6daf959ab34063e4351caba5b0e33788bdcb279890730fc86ce5` for `PiPresentation.ts`, and `ae14c0b73de4ee05f4e2222a6d7b1728ba1692896829f706ed366f620a0120f9` for `PiResourcesPresentation.ts`.
- The restoration trap reported `RESTORATION_ATTEMPTED=1` and `RESTORATION_OK=1`. Post-remediation hashes exactly matched every pre-remediation hash above, proving byte identity for all three production files.
- The transient patch and RED log were removed after restoration; a final `/tmp` check found no `pi-ux-hardening-wu2-production.*.patch` or `pi-ux-hardening-wu2-red.*.log` file. The exact scoped product paths remained present and no additional path was created or modified.

### GREEN and full verification after exact restoration

- `node --test .pi/extensions/garfex/hosts/pi/PiPresentation.test.ts .pi/extensions/garfex/hosts/pi/PiResourcesPresentation.test.ts` — **15/15 passed**.
- `npm test` — **46/46 passed**.
- `npm run check:architecture` — **passed** with `Architecture check passed.`
- `git diff --check` — **passed** with no output.
- Fresh source/type sanity passed for all three transient production files with `node --experimental-strip-types --check`; fresh direct TypeScript imports passed **3/3**.
- No final product source or test behavior changed. The product candidate is byte-identical before and after the remediation; the only persistent change is this lifecycle evidence append. The existing failed verify report remains untouched.

### Remediation TDD evidence and line accounting

| Remediation slice | Test layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- |
| Work Unit 2 production evidence remediation | Native Pi presentation integration and projection tests in `PiPresentation.test.ts` and `PiResourcesPresentation.test.ts` | 15/15 focused tests before reversal | Reversed candidate produced 9 pass / 6 fail, exit 1; five exact direct assertion failures cover guidance, cancel, cues, and hint projection, with the secondary constructor/callback failure recorded above | Exact saved patch reapplied; focused suite 15/15 | Full `npm test` 46/46 plus focused remapped bindings, cancel hierarchy, cues, Unicode, long draft, whitespace, resize, availability, and Spanish-copy scenarios | No source/test refactor; only byte restoration and lifecycle evidence recording |

- Final product changed-line count for this remediation: **0**. The temporary saved patch represented the already-present candidate diff of 116 additions and 16 deletions across three files (132 patch lines), but it was never a new authored product change and was removed after the reverse/reapply cycle. The native attempt candidate ledger remained at `changed_lines: 0`.
- The persistent lifecycle evidence append is excluded from both stacked product-slice counts. Work Unit 2 remains its prior 338 changed lines across its six-file slice, and Work Unit 1 remains its prior 196 changed lines; no review boundary or rollback boundary changed.

### Final triangulation assertion

- The remapped-cancel scenario now explicitly focuses the Surface, types `dato`, sends raw Escape, and proves the view remains Search with the exact draft and native cursor marker still rendered.
- The first version of this added assertion correctly preserved the draft but lacked the focus precondition; it failed only on the cursor marker. Establishing `surface.focused = true` fixed the test setup rather than changing production behavior.
- Final revalidation passed: focused presentation tests 15/15, full suite 46/46, architecture check passed, and `git diff --check` passed.
- Final Slice 2 accounting is **320 additions + 23 deletions = 343 changed lines**, still below 400. Slice 1 remains 196 lines.
- This test-only triangulation is the changed correction candidate bound to the reproduced Work Unit 2 RED evidence; no production source changed.

### Residual risk and next lifecycle action

- Functional, strict-TDD, and source sanity evidence is green, but the parent must settle the active native remediation attempt against the exact failed verification revision above and request the fresh independent verification required by native authority. This executor did not settle, verify, review, create receipts, or alter the failed verify report.
- No new runtime, architecture, privacy, or product behavior risk was introduced. The remaining lifecycle risk is procedural only: archive must remain blocked until the parent-owned remediation settlement and fresh verification complete.
- This phase returns `parent-lifecycle`.
