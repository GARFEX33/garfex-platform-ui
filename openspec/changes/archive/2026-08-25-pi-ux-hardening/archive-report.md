# Archive Report — `pi-ux-hardening`

## Status

**PASS — archive completed.**

The corrective archive rerun passed after the explicit `sdd-sync` phase resolved the prior missing-sync precondition. The active change was moved to the dated archive without modifying product code, tests, canonical spec content, repository docs/ADRs, or Git delivery state.

## Artifacts read

- `openspec/changes/pi-ux-hardening/proposal.md`
- `openspec/changes/pi-ux-hardening/specs/pi-surface/spec.md`
- `openspec/changes/pi-ux-hardening/design.md`
- `openspec/changes/pi-ux-hardening/tasks.md`
- `openspec/changes/pi-ux-hardening/apply-progress.md`
- `openspec/changes/pi-ux-hardening/verify-report.md`
- `openspec/changes/pi-ux-hardening/sync-report.md`
- `openspec/specs/pi-surface/spec.md`
- `openspec/config.yaml`
- Prior blocked `openspec/changes/pi-ux-hardening/archive-report.md`
- `/tmp/pi-ux-hardening-sdd-dispatch.txt`
- Current Git status and diff

## Verification and completion gate

- Evidence revision: `sha256:1a7620ec575176e3ed2a539f8e76144197f4e9290c32685715d3f02628d4411b`
- Verify verdict: **PASS**; blockers: 0; critical findings: 0.
- Requirements: **8/8**.
- Scenarios: **18/18**.
- Acceptance criteria: **8/8**.
- Implementation tasks: **29/29**; the persisted `tasks.md` was re-read immediately before this report and contains no unchecked `- [ ]` implementation task lines.
- Tests: focused command **6/6**, focused presentation **15/15**, `npm test` **46/46**.
- Architecture: `npm run check:architecture` passed.
- Diff validation: `git diff --check` passed.
- Fresh primary LSP was clean. The cached three-argument auxiliary warning was dispositioned as a false positive: current source has a four-parameter constructor and four-argument call, and the fresh full lens scan reported no error issues.

## Canonical sync

- Domain synced: `pi-surface`.
- Source: `openspec/changes/pi-ux-hardening/specs/pi-surface/spec.md`.
- Destination: `openspec/specs/pi-surface/spec.md`.
- Sync result: successful full-domain copy because the canonical destination was previously absent.
- Source and destination are byte-identical at SHA-256 `379d5c1745c366bfa5dfeefaa3f3f0fcba4f6b78bf2e24dbb98bad513b295c5f`.
- ADDED requirements: none; MODIFIED requirements: none; REMOVED requirements: none. No destructive merge occurred, so no destructive approval was required.
- Active same-domain change warnings: none.
- Legacy flat `spec.md`: absent; domain spec layout is valid.
- Sync observation: **1673**.

## Delivery and evidence receipts

- Slice 1: **196 changed lines**; Slice 2: **343 changed lines**. These are conceptual stacked-to-main review boundaries only; no delivery action was performed.
- Genuine strict-TDD RED reproduction and final triangulation are recorded in `apply-progress.md` and bound by the passing verification report.
- The first archive attempt was blocked because `sync-report.md` and the canonical spec were missing and archive-time sync fallback had not been authorized. The subsequent explicit sync completed successfully, after which this corrective archive rerun was performed.
- No ordinary review, Judgment Day, receipt/approval flow, commit, push, PR, or publication occurred.
- No product code/tests, canonical spec content, repository docs/ADRs, or Git delivery state were modified by archive.
- The bounded diagnostic stack-data privacy note remains the only recorded residual risk; technical details stay outside primary UX/LLM context by design.

## Structured status and action context

- Change selection: unambiguous `pi-ux-hardening`.
- Native status: `artifactStore: openspec`, `nextRecommended: archive`, `archive: ready`, `verify: all_done`, `blockedReasons: []`.
- Task progress: `29/29`; all dependencies report complete.
- Action context: `mode: repo-local`; workspace root and allowed edit root are `/home/garfex/PROGRAMACION/garfex-platform-ui`.
- Archive source and target were within the authoritative workspace and allowed edit root.
- `openspec/config.yaml` rules were read; no additional archive rule changed the standard dated move.

## Memory traceability

The file-backed change artifacts were authoritative for this archive. Known Engram mirrors preserved in the lifecycle record are:

- Proposal: **1659**
- Spec: **1660**
- Design: **1661**
- Tasks: **1664**
- Apply progress: **1667**
- Verification: **1668/1669**
- Prior blocked archive report: **1671**
- Sync report: **1673**

The final archive report is also mirrored to topic `sdd/pi-ux-hardening/archive-report` when the Engram provider is available.

## Archived path

`openspec/changes/archive/2026-08-25-pi-ux-hardening/`

## Post-archive publication revalidation

Before the explicitly requested commit/push lifecycle, three already-authorized files contained later behavior-preserving normalization relative to the archived byte snapshot: expanded test formatting and replacement of TypeScript constructor parameter properties with equivalent explicit readonly assignments. No scenario or product behavior was added.

The current bytes were independently revalidated under ordinary repository policy because receipt-driven review is disabled:

- Slice 1: **244 additions + 7 deletions = 251 changed lines** across `index.ts` and `index.test.ts`.
- Slice 2: **365 additions + 31 deletions = 396 changed lines** across the six presentation/composition files.
- Both current review slices remain within the 400-line budget.
- Focused tests: **6/6** and **15/15**.
- Full suite: **46/46**.
- Architecture and `git diff --check`: **PASS**.
- Current `main` and `origin/main` were equal at `b99a28ed40cc736f51b40fbe1039e5665bfd4fba` before commit.

This later evidence supplements rather than rewrites the archived SDD evidence revision and its original line accounting.

## Next recommended

`parent-lifecycle` — the SDD archive is complete. Any later review, commit, push, PR, or publication requires an explicit separate request.
