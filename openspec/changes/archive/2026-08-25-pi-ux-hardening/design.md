# Design: harden the existing Pi presentation at its owned boundaries

## Decision summary

Implement three cohesive changes inside the existing project-local GARFEX Pi extension:

1. Retain opening failures as non-rendered Pi custom session entries through `ExtensionAPI.appendEntry()` while preserving the existing safe Spanish notification.
2. Pass Pi 0.84.2's injected `KeybindingsManager` into the existing Surface, use its namespaced actions for control, and use Pi's exported `keyText()`/`keyHint()` formatting for concise Spanish help.
3. Add textual active-state presentation without replacing or wrapping native `SelectList` or `Input`: selected list rows use `SelectList`'s existing `truncatePrimary({ isSelected })` callback, and Search adds static focus text next to its retained native input.

No host-neutral Resources model change is designed. Existing draft, resize, navigation, and availability behavior remains unchanged unless a focused test first demonstrates a GARFEX-owned defect.

## Scope and architecture impact

The implementation remains under `.pi/extensions/garfex/` because this repository has no `packages/coding-agent` directory and the requested behavior is implemented by the project-local Pi host extension. Dependency direction remains:

```text
index.ts (Pi extension entry and command recovery)
  -> composition/createPiSurface.ts
    -> hosts/pi/PiPresentation.ts
      -> hosts/pi/PiResourcesPresentation.ts
      -> surface/features/resources/* (unchanged)
```

This is a local Pi-presentation hardening slice, not a new architecture layer. It adds no generic adapter, port, visual framework, host, capability, remote dependency, ADR, or architecture tooling.

## Grounded Pi 0.84.2 contracts

| Concern | Pinned API/source | Design consequence |
| --- | --- | --- |
| Custom Surface | `ExtensionUIContext.custom(factory)` passes `(tui, theme, keybindings, done)` in `node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/types.d.ts` | Stop discarding the injected manager in `createPiSurface.ts`; pass it to `GarfexSurfaceComponent`. |
| Maintainer retention | `ExtensionAPI.appendEntry(customType, data)` is documented as session persistence “not sent to LLM” in the same type file | Store one structured, non-rendered opening diagnostic per failed invocation. Do not use notifications, messages, widgets, or status for technical detail. |
| Configured controls | `KeybindingsManager.matches()`, `getKeys()`, and Pi's namespaced actions are declared in `pi-tui/dist/keybindings.d.ts` | Route cancel through injected `keybindings.matches(data, "tui.select.cancel")`; do not preserve raw Escape as an independent hidden binding. |
| Display labels | `keyText(action)` and `keyHint(action, description)` are exported by `pi-coding-agent`; their 0.84.2 source formats keys from the active global Pi registry | Use these helpers for rendered key labels. In a real `ctx.ui.custom` callback, Pi's injected manager and global TUI registry are the same active configuration; tests install the same manager in the TUI registry. |
| List interaction | Native `SelectList.handleInput()` uses `tui.select.up`, `.down`, `.confirm`, and `.cancel`; `getSelectedItem()` and `truncatePrimary({ isSelected })` are public in `select-list.d.ts` | Keep native selection ownership. Derive the word cue from `isSelected`; do not copy index or selected value into GARFEX state. |
| Input cancellation | Native `Input.handleInput()` matches `tui.select.cancel` and invokes `onEscape` in `input.js` | Use the same cancel action in Search help and Surface routing. There is no separate configurable “back” or “close GARFEX” action. |
| Width guarantee | Pi's TUI contract requires each rendered line to fit `width`; current Surface clamps to at least 1 and finally calls `truncateToWidth(line, safeWidth, "")` | Keep the final width pipeline unchanged. Prefix essential state text and allow optional help tails to wrap/truncate rather than adding a second renderer. |

`docs/extensions.md` explicitly says custom components receive the injected manager and documents `keyHint()`/`keyText()`; `docs/keybindings.md` defines the supported `tui.select.*` actions and defaults; `docs/tui.md` requires width-bounded lines and recommends native components.

## Decision 1: retain diagnostics through a non-rendered Pi custom entry

### Boundary

The command's existing `try/catch` remains the sole opening-recovery boundary. Change `catch` to bind `error: unknown`. The default extension registration supplies a narrow GARFEX-specific diagnostic callback backed by:

```ts
pi.appendEntry("garfex.opening-failure", {
  operation: "open-surface",
  name,
  message,
  stack,
});
```

Normalization is local and typed from `unknown`:

- `Error`: retain `name`, `message`, and `stack` when present.
- Other thrown values: retain a bounded `String(error)` as `message`, with `name: "NonErrorThrow"` and no stack.
- The record contains no command arguments, draft, prompt, cwd, model/session content, environment, or user input.

No custom entry renderer is registered, so the entry is neither primary UI nor LLM context. Maintainers can inspect the Pi session record. This is narrower and safer than a visible message/status/widget, and more durable than `console.error`/`process.stderr`. It also avoids global process listeners or hooks.

### Ordering and failure behavior

For a caught opening error:

1. Emit the existing safe notification exactly once via `reportSafeFailure(context)`.
2. Attempt exactly one `appendEntry` diagnostic write.
3. Return `"failed"` and release all invocation-local references.

The diagnostic write is best-effort and isolated at this boundary. If `appendEntry` itself throws, suppress that secondary sink failure after the safe notification; do not recurse, notify again, write to process streams, or let Pi's generic extension error renderer expose a stack in the transcript. This small local guard is not a distributed catch strategy: both opening recovery and sink containment remain adjacent in `runGarfexCommand()`.

A subsequent command call always invokes `openPiSurface(context)` again and creates a fresh component. No failure flag or retained runtime object is introduced.

### Privacy properties

- User-visible copy remains `No se pudo abrir GARFEX. Inténtalo de nuevo.`
- Thrown details never enter `ctx.ui.notify`, rendered components, `sendMessage`, or LLM context.
- Diagnostic data is limited to the thrown failure and operation label; Search draft and other interaction state are excluded.
- Historical custom entries require no migration or cleanup because no runtime code reads them.

## Decision 2: derive guidance and control from active keybindings

### Control flow

`createPiSurface.ts` passes the injected `KeybindingsManager` to `GarfexSurfaceComponent`. The Surface retains that host object and handles cancel before delegating input:

```text
terminal bytes
  -> GarfexSurfaceComponent.handleInput
    -> injected keybindings.matches(data, "tui.select.cancel")
      -> existing goBack hierarchy
    -> otherwise native active.handleInput(data)
      -> native SelectList/Input action handling
    -> existing draft synchronization and requestRender
```

This replaces only the current raw `matchesKey(data, Key.escape)` interception. Native components still own movement, confirmation, text editing, cursor, paste, and cancellation callbacks. The Surface owns only its established semantic back hierarchy.

### Guidance mapping

| Context | Pi action/label | Spanish guidance |
| --- | --- | --- |
| List movement | combine `keyText("tui.select.up")` and `keyText("tui.select.down")` | `<keys>: mover` |
| Choose selected row | `keyHint("tui.select.confirm", "elegir")` | Pi-formatted configured key plus `elegir` |
| Home cancel | `keyHint("tui.select.cancel", "cerrar GARFEX")` | Contextual close semantics |
| Resources cancel | `keyHint("tui.select.cancel", "volver a GARFEX")` | Contextual back semantics |
| Search cancel | `keyHint("tui.select.cancel", "volver a Recursos")` | Same action used by native `Input` |
| Search typing | no namespaced action is needed for printable input | `Escribe para preparar el borrador` with no invented key label |

Close/back are semantic outcomes, not configurable action ids in Pi 0.84.2. They therefore map contextually to `tui.select.cancel`; no fake `garfex.back`, `garfex.close`, `app.interrupt`, or raw `Esc` hint is introduced. Search execution remains absent, so `tui.input.submit` is not advertised.

When an action has no configured keys, its key-derived fragment is omitted rather than falling back to a default. Remaining Spanish state/availability text stays truthful and never claims an inactive key. The helper that joins hint fragments is presentation-specific and local; it is not a generic keybinding adapter.

## Decision 3: additive textual active-state cues with native ownership

### Lists

Use the already configured `SelectList` layout callback:

```ts
truncatePrimary: ({ text, maxWidth, isSelected }) =>
  truncateToWidth(isSelected ? `Activa: ${text}` : text, Math.max(1, maxWidth), "")
```

`isSelected` comes directly from native `SelectList.renderItem()`. No selected index/value is stored by GARFEX, and no wrapper component is introduced. Native arrow and theme styling remain additive. The cue starts with the word `Activa`, so state survives before optional label detail at constrained widths whenever that word is representable.

### Search

Add a normal native `Text` adjacent to the retained native `Input`, for example `Campo activo: borrador de búsqueda`. This is static view metadata because Search has exactly one active control. It does not mirror focus state, draft, cursor, or value. `Input` remains the `active` component and continues to receive all text interaction and focus propagation.

## Narrow-width behavior

The existing rendering pipeline remains authoritative:

1. `safeWidth = max(1, floor(width))`.
2. Native `Text` wraps, native `SelectList` truncates rows, and native `Input` horizontally scrolls by display width.
3. Every final line is ANSI-aware truncated with `truncateToWidth(line, safeWidth, "")`.

Presentation priority is encoded in copy order, not a new responsive framework:

1. Truthful title/status and active-state words.
2. Native interactive control.
3. Cancel/back guidance.
4. Movement/confirmation and descriptive tails.

Unbound action fragments are omitted before rendering. At widths too small for a complete word, final truncation may show only a prefix; it must still stay in bounds and must not substitute an inactive default. Existing width tests remain the invariant, expanded across repeated view/resize sequences.

## File-level implementation plan

| File | Intended change |
| --- | --- |
| `.pi/extensions/garfex/index.ts` | Bind the caught error, normalize a minimal diagnostic record, append one non-rendered `garfex.opening-failure` entry through an injected GARFEX-specific callback, preserve safe notification and return behavior, and contain sink failure locally. |
| `.pi/extensions/garfex/index.test.ts` | Add RED-first evidence for exact retained diagnostics, no user leakage, one notification, sink-failure safety, and failed-open then successful retry. |
| `.pi/extensions/garfex/composition/createPiSurface.ts` | Pass the callback-injected `KeybindingsManager` into the existing Surface constructor. |
| `.pi/extensions/garfex/hosts/pi/PiPresentation.ts` | Retain the manager; route cancel using `tui.select.cancel`; build configuration-aware Spanish help; prefix selected native rows with `Activa:`; add static Search focus text; preserve native components and final truncation. |
| `.pi/extensions/garfex/hosts/pi/PiResourcesPresentation.ts` | Replace hard-coded physical-key hint strings with semantic Spanish hint metadata/fragments consumed by Pi presentation; retain availability wording and items. |
| `.pi/extensions/garfex/hosts/pi/PiPresentationTestSupport.ts` | Create/install a real Pi 0.84.2 `KeybindingsManager` for default and remapped test configurations; keep the fake TUI/theme minimal. |
| `.pi/extensions/garfex/hosts/pi/PiPresentation.test.ts` | Add focused remapping, active-cue, exact draft, long-input, narrow resize, and repeated navigation evidence. |
| `.pi/extensions/garfex/hosts/pi/PiResourcesPresentation.test.ts` | Update only assertions directly affected by semantic hint metadata and retain honest-availability/copy constraints. |

No file under `.pi/extensions/garfex/surface/features/resources/` changes unless a new focused test is RED because that host-neutral model already preserves exact draft and established semantic transitions.

## Strict TDD seams and representative evidence

Implementation proceeds test-first at GARFEX-owned boundaries.

### Command recovery seam

Extend `runGarfexCommand` with a narrow optional diagnostic callback used by production registration and tests. RED tests must prove:

- An `Error("distinctive secret")` yields one safe Spanish notification and one diagnostic containing its name/message/stack, while no notice contains the distinctive detail.
- A non-`Error` throw is safely normalized without crashing.
- A throwing diagnostic sink still leaves exactly one safe notice and returns `"failed"` without Pi's generic error path.
- One context whose `ui.custom` throws on call 1 and resolves on call 2 returns `"failed"`, then `"closed"`; call 2 adds no notice or stale diagnostic.

### Pi presentation seam

Use the real Pi 0.84.2 manager with remaps such as `tui.select.up = alt+k`, `down = alt+j`, `confirm = ctrl+enter`, and `cancel = ctrl+x`. RED tests must prove:

- Rendered Spanish help contains active labels and omits inactive `up/down/enter/escape` defaults.
- `ctrl+x` follows the existing Search → Resources → Home → close hierarchy; raw Escape is not asserted operational after remapping.
- The selected row includes `Activa:` before and after native navigation, without any GARFEX selected-index field.
- Search rendering includes `Campo activo:` while `CURSOR_MARKER` and native Input focus remain present.

### Exact interaction and resize seam

Representative tests, not a Pi conformance suite:

- Combining sequence: insert and retain an exact value such as `Cafe\u0301`, move the cursor with configured native cursor input, leave/reopen Search, then assert code-point equality, insertion position, and focus marker.
- Long draft: enter a value longer than the available input width, render narrowly, leave/reopen, and assert the full exact draft plus in-bounds lines; do not snapshot Pi's scrolling algorithm.
- Whitespace/paste equivalent: send bracketed paste bytes `\x1b[200~  uno\t dos  \x1b[201~`, leave/reopen, and assert exact line-safe whitespace with no execution/error side effect.
- Repeated sequence: navigate Home/Resources/Search repeatedly while rendering at representative widths such as 60, 20, 8, and 1; after every render assert `visibleWidth(line) <= max(1, floor(width))`, continued navigation, exact draft, and truthful unavailable copy where representable.

Existing tests for spaced `ñ`, Ctrl+C/default cancel, Escape/default hierarchy, widths 1/8/20, cursor/focus retention, and honest availability stay unless subsumed without loss.

### RED evidence rule for already-correct behavior

Combining, long, whitespace/paste, resize, navigation, draft, focus, and availability tests are initially evidence tests against current behavior. If they pass before production changes, no production modification is permitted for that concern. A production change is justified only by a failing assertion at a GARFEX-owned seam, not by a desire to improve or duplicate native Pi internals.

## Alternatives rejected

| Alternative | Why rejected |
| --- | --- |
| Let the command error escape so Pi logs it | Pi 0.84.2 interactive runtime renders extension errors and stack traces in the transcript, violating safe primary UX. |
| `console.error`, `process.stderr`, or global uncaught-error hooks | Not a durable Pi-owned diagnostic record; streams can disrupt or leak into interactive UX, and hooks broaden process scope. |
| Visible notification/status/widget/custom message for diagnostics | Exposes technical details in primary UI or session conversation. |
| Generic logger/diagnostic port | Unnecessary abstraction for one command boundary; a narrow callback is sufficient. |
| New GARFEX list/input component or wrapper | Duplicates Pi-owned interaction and violates the native-component constraint. |
| Mirror selection index/value in Surface or Resources state | Native `isSelected`/`getSelectedItem()` already expose the needed state; duplication invites drift. |
| Hard-code Escape/Enter/arrows as fallbacks | Misrepresents remapped or disabled bindings and keeps hidden inactive defaults operational. |
| Add custom GARFEX keybinding ids | Pi 0.84.2 already defines the exact native actions; close/back are contextual semantics, not new actions. |
| Responsive layout framework or capability probing | Existing native wrapping/truncation and final width clamp already provide the required degradation. |

## Tradeoffs and risks

- Custom diagnostic entries persist in the Pi session file. This improves maintainer diagnosis but means session sharing can include stack data; normalization therefore excludes all context except failure fields and operation. No renderer or LLM delivery is registered.
- `keyHint()`/`keyText()` read Pi's active global TUI registry, while control uses the injected manager. Pi 0.84.2 installs and injects the same manager; tests must recreate that invariant rather than mock labels independently.
- Prefixing `Activa:` consumes row width. Labels/descriptions may truncate sooner, but interaction remains native and the explicit state word has higher accessibility priority.
- At one-column widths no complete textual cue can be represented. The guarantee is safe in-bounds truncation and no false key claim, not impossible full readability.

## Rollout and rollback

No migration, feature flag, remote rollout, or compatibility shim is required. Land the diagnostic, keybinding/help, cue, and focused tests as one small slice after RED-to-GREEN evidence and the existing `npm test` plus `npm run check:architecture` pass.

Rollback is file-local:

1. Remove custom diagnostic append/normalization while retaining `reportSafeFailure`.
2. Revert dynamic help/cue additions and constructor manager plumbing while keeping native `SelectList`, `Input`, and existing Surface navigation.
3. Remove only tests tied to reverted behavior.

Historical `garfex.opening-failure` entries are inert, non-rendered records and require no data cleanup. Resources state, availability projection, navigation hierarchy, and architecture checks remain untouched throughout.
