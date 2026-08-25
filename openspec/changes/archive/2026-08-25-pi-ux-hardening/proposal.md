# Harden the existing Pi UX without expanding the product surface

This change closes two narrow operational/accessibility gaps and adds durable regression confidence around the existing GARFEX Pi Surface. It preserves the mature native Pi interaction model and does not introduce new product capabilities, hosts, abstractions, or visual components.

## Problem statement

The current Pi Surface already provides the intended navigation, draft retention, focus behavior, narrow-width rendering, honest availability, Spanish product copy, and safe opening-failure recovery. However:

1. An unexpected opening failure is reduced to a safe user notification while the thrown technical detail is discarded, limiting diagnosis and supportability.
2. Keyboard hints are hard-coded rather than derived from active Pi keybindings, and selection/focus is communicated without a word-level textual cue.
3. Several high-value interaction boundaries are supported by native Pi behavior but lack focused repository-level regression coverage where GARFEX composes or retains that behavior.

## Evidence and current-state gap

Exploration of current `main` (`b99a28ed40cc736f51b40fbe1039e5665bfd4fba`) found a single native, non-overlay `ctx.ui.custom` Surface built from Pi components. Existing tests cover exact spaced and `ñ` draft retention, cursor/focus retention after reopening Search, Ctrl+C/Escape navigation, opening failure notification, and widths 1, 8, and 20.

The remaining evidence-backed gaps are:

- `runGarfexCommand()` catches an unexpected opening error without retaining its thrown value, and the extension has no demonstrated technical diagnostic sink.
- Presentation hints hard-code keys while the injected Pi keybindings manager is unused; Pi 0.84.2 provides configurable namespaced bindings and `keyHint()`/`keyText()` APIs.
- Native `SelectList` provides an arrow and theme styling, but the GARFEX presentation provides no explicit word-level selected/focused cue.
- Tests do not directly exercise representative combining sequences, long horizontally scrolling drafts, whitespace/paste-equivalent input, resize/repeated interaction sequences, retry after a failed open, or retention of the failed-open diagnostic.

These are hardening gaps, not evidence that the established native Pi foundations need replacement.

## Product outcome

After this change:

- A user who encounters an unexpected opening failure still receives one safe, actionable Spanish recovery message with no stack trace or technical detail in the primary UX.
- Maintainers retain enough technical failure information to diagnose that opening failure.
- Keyboard help reflects the active Pi 0.84.2 keybinding configuration rather than assuming default keys.
- The current selection/focus state has a textual cue in addition to native visual styling, while interaction continues to use native `SelectList`.
- Focused tests protect GARFEX-owned composition, state retention, recovery, and diagnostic boundaries without duplicating exhaustive tests for Pi-owned primitives.

## Exact scope

### 1. Retain safe opening diagnostics

- Preserve the existing single command-level recovery boundary for unexpected Surface-opening failures.
- Retain the thrown failure in a technical diagnostic path suitable for maintainers.
- Keep the primary user-facing recovery message safe, actionable, and Spanish.
- Prevent stack traces, thrown details, and internal terminology from leaking into the primary user experience.
- Confirm that a failed opening attempt does not prevent a later command invocation from opening a fresh Surface.

### 2. Make guidance configuration-aware and textual

- Use the real injected Pi 0.84.2 keybinding APIs, including its key hint/text facilities as appropriate, for displayed keyboard guidance.
- Add a concise textual cue for the active selection/focus state so it is not conveyed only through glyph position, color, or theme styling.
- Retain native `SelectList`, native `Input`, and the existing single-Surface navigation and focus model.
- Keep all product-visible wording Spanish and all technical artifacts English.

### 3. Add focused durable regression coverage

Add representative tests only at GARFEX-owned boundaries where they provide confidence beyond native Pi ownership:

- Unicode input containing a combining sequence.
- A long draft that exercises retained input and horizontal-scroll composition.
- Exact whitespace and paste-equivalent draft handling without invented trimming or empty-value semantics.
- Resize and repeated navigation/interaction sequences, including narrow widths.
- Retry behavior after an unexpected opening failure.
- Retention of technical diagnostic detail alongside a safe user notification.
- Configuration-aware keyboard guidance and a textual active-state cue.

The test suite should assert product outcomes and integration boundaries rather than reimplementing or exhaustively retesting Pi's grapheme, width, input, or list internals.

## Already-satisfied behavior to preserve

- One native custom, non-overlay Pi Surface with no parallel visual framework.
- Retained Search draft, cursor, and focus for the lifetime of that Surface.
- Predictable Escape and Ctrl+C navigation/cancellation behavior.
- Width clamping and ANSI-aware final-line truncation at narrow terminal widths.
- Honest information architecture and availability messaging.
- Spanish product copy and one safe user-facing opening-failure boundary.
- Host-neutral Resources feature state limited to location, exact draft, availability projection, semantic intents, and return-home effect.
- Existing proportional architecture checks and repository dependency direction.

## Non-goals

- Search execution, results, detail, create, or authentication flows.
- Remote state, loaders, backend clients, or network operations.
- Invented contracts, data, capabilities, permissions, or empty/whitespace semantics.
- A Web host or any additional host.
- Generic `UiPort`/`HostPort` abstractions.
- Frontend domain or business state.
- GARFEX replacements for native Pi components, including `SelectList` and `Input`.
- A parallel visual framework or Surface redesign.
- Broad architecture-check infrastructure.
- A redundant ADR; one is warranted only if implementation uncovers a genuinely new durable decision.
- Changes to the established navigation hierarchy or existing unavailable-feature boundaries.

## Impact

| Area | Expected impact |
| --- | --- |
| Users | More accurate keyboard help, a textual active-state cue, and unchanged safe Spanish recovery on opening failure. |
| Maintainers and support | Preserved technical context for unexpected opening failures and focused regression evidence for recovery and interaction boundaries. |
| Pi host composition | Narrow adaptation of injected keybindings and presentation metadata; no host or component replacement. |
| Resources feature boundary | No new domain state, business behavior, contracts, or remote dependencies. |
| Tests | Focused additions around GARFEX-owned integration and retention behavior; no broad native Pi conformance suite. |
| Architecture and operations | Existing checks and deployment model remain unchanged. |

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Diagnostics expose sensitive or internal detail to users. | Keep technical diagnostics separate from the single safe Spanish user notification and assert non-leakage in tests. |
| Diagnostic handling accidentally swallows, duplicates, or destabilizes recovery. | Preserve one recovery boundary and test both one diagnostic retention event and a successful later retry. |
| Key hints drift from actual remapped bindings. | Resolve displayed help through Pi 0.84.2's active keybinding APIs rather than duplicating defaults. |
| A textual cue creates visual clutter or conflicts with native selection. | Keep the cue concise and additive; retain native `SelectList` behavior and narrow-width constraints. |
| Tests become coupled to Pi internals and fail on harmless rendering changes. | Assert GARFEX-owned outcomes at representative boundaries, not exhaustive component internals. |
| Hardening expands into a redesign or speculative capability work. | Enforce the explicit non-goals and preserve all already-satisfied behavior. |

## Rollback boundary

Rollback is limited to the diagnostic-retention adapter, configuration-aware hint/cue presentation changes, and their focused tests. Reverting this slice must restore the prior safe user notification and native Surface behavior without touching the Resources feature model, navigation hierarchy, host boundary, architecture checks, or introducing compatibility migrations. No remote data or persisted user state is created, so rollback requires no data migration.

If a diagnostic path proves unsafe, disable only technical retention while preserving the safe Spanish user recovery boundary. If configured hints or the textual cue regress rendering, revert those presentation additions while retaining native `SelectList` and existing navigation.

## Acceptance outline

- [ ] An unexpected opening failure produces exactly the safe Spanish recovery experience and does not expose stack or thrown detail in primary UX.
- [ ] The same failure's technical detail is retained through a maintainer-facing diagnostic boundary.
- [ ] A later command invocation can successfully open a fresh Surface after an earlier opening failure.
- [ ] Displayed keyboard help reflects active Pi 0.84.2 keybindings, including remapped bindings exercised by focused tests.
- [ ] Active selection/focus has a concise textual cue in addition to native visual styling.
- [ ] Native `SelectList`, `Input`, one-Surface structure, navigation, draft/cursor/focus retention, and narrow-width guarantees remain intact.
- [ ] Focused tests cover representative combining Unicode, long draft, exact whitespace/paste-equivalent input, resize/repeated interaction, opening retry, and diagnostic retention risks.
- [ ] Tests remain bounded to GARFEX-owned behavior and do not duplicate broad Pi primitive ownership.
- [ ] No excluded product capability, host, remote dependency, generic port, frontend business state, visual framework, broad architecture infrastructure, or speculative ADR is introduced.

## Success criteria

The change is successful when maintainers can diagnose unexpected Surface-opening failures without exposing technical detail to users; keyboard and active-state guidance remains accurate and understandable under configured bindings; the representative hardening scenarios have durable regression coverage; and all previously satisfied Pi UX and architecture behavior remains unchanged.

## Proposal question round

This proposal proceeds in automatic mode from the binding user outcome. The following product assumptions are non-blocking review points rather than invitations to expand scope:

1. **Recovery copy:** preserve the current safe Spanish recovery intent and avoid additional user-visible error variants unless evidence shows the existing wording is misleading.
2. **Accessible state cue:** treat a concise Spanish word-level active-state indicator as sufficient; do not redesign list navigation or create GARFEX controls.
3. **Diagnostic audience:** optimize retained detail for maintainers/support while keeping it entirely outside primary user-facing rendering and notifications.
4. **Coverage depth:** test one or a small representative set per listed risk, expanding only when a GARFEX-owned defect or invariant requires it.

Reviewers may correct these assumptions or request a second product question round before subsequent SDD phases. No unresolved assumption changes the explicit scope above.
