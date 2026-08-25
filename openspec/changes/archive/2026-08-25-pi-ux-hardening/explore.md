# Pi UX hardening — evidence-first exploration

## Conclusion

Current `main` (`b99a28ed40cc736f51b40fbe1039e5665bfd4fba`) already materializes the Pi UI Kit v1 foundation. The audit found **two product/operational gaps** and **one verification gap** worth carrying into `pi-ux-hardening`; it found no evidence supporting a redesign, another host, a generic UI layer, or invented GARFEX capabilities.

## Demonstrated gaps

1. **Opening failures discard diagnostics.** `runGarfexCommand()` has the correct single safe user-facing recovery boundary, but its bare `catch` drops the thrown value and no diagnostic sink exists. The Spanish notification is safe and actionable; retained technical diagnostics are absent.
2. **Keyboard and selection guidance is not fully textual or configuration-aware.** Product hints hard-code `↑/↓`, `Enter`, and `Esc`, while `createPiSurface()` discards Pi's injected keybindings manager. Pi 0.84.2 documents configurable namespaced bindings and `keyHint()`/`keyText()`. Native `SelectList` indicates selection with an arrow prefix and theme styling, but GARFEX adds no word-level selected/focused state. This leaves remapped users with potentially inaccurate instructions and users who cannot rely on glyph/color styling without an explicit textual selection cue.
3. **Hardening edge cases lack repository-level verification.** Current implementation delegates long text, Unicode input, grapheme cursor movement, horizontal scrolling, and width measurement to pinned native Pi components, and existing tests cover exact spaced/`ñ` draft retention, cursor retention on reopen, Ctrl+C/Escape navigation, and widths 1/8/20. Tests do not directly cover combining sequences, long drafts under horizontal scrolling, bracketed-paste whitespace behavior, resize sequences, repeated command recovery after a thrown open, or preservation of the thrown diagnostic. This is a verification gap, not evidence that those native behaviors currently fail.

## Already satisfied

- One non-overlay `ctx.ui.custom` Surface is constructed with Pi-native `SelectList`, `Input`, `Container`, `Box`, `Text`, `Spacer`, `DynamicBorder`, and width helpers.
- Search → Resources → Search retains the same native `Input` instance, exact feature draft, cursor position, and focus marker for one Surface lifetime.
- Escape follows Search → Resources → GARFEX → close; native Ctrl+C cancellation returns from Search without clearing or executing the draft.
- Native `Input` accepts printable Unicode, uses grapheme segmentation for cursor/deletion, and horizontally scrolls long values. The feature stores the returned string without trimming or assigning empty/whitespace semantics.
- Rendering clamps width to at least one column and applies ANSI-aware `truncateToWidth` to every final line; the existing test asserts `visibleWidth(line) <= width` at widths 1, 8, and 20. Native `Text` wraps and `Input` scrolls based on display width.
- Information architecture has no fake branch: Home offers Resources or close; Resources offers draft preparation or back; Search says execution is unavailable and offers back. Search execution/results/detail/create/auth remain absent.
- Pi-visible copy is Spanish and the existing copy tests reject execution claims and selected internal wording. No backend client, remote operation, loader, auth, permission, Web host, or `@garfex/*` dependency appears in the Surface source.
- Non-TUI modes are gated honestly. Unexpected opening failures produce one actionable Spanish message without leaking the thrown detail, and another command invocation constructs a fresh Surface.
- The host-neutral Resources feature owns only location, exact draft, availability projection, semantic intents, and a return-home effect. Pi rendering, focus, keys, and physical navigation remain under `hosts/pi/`/composition.
- The architecture checker enforces repository independence, headless/host direction, anti-framework structure, and fake-artifact constraints. The source declares 35 Node tests when the 10 generated architecture fixture cases are counted; this executor could not run them because no shell tool was available.

## Evidence table

| Status | Claim | Exact evidence |
| --- | --- | --- |
| Gap | Thrown opening error is discarded | `.pi/extensions/garfex/index.ts` — `runGarfexCommand()`, bare `catch`; `.pi/extensions/garfex/hosts/pi/PiRuntime.ts` — `reportSafeFailure()`; grep found no diagnostic/logging sink in the extension |
| Gap | Hints ignore configured keybindings | `.pi/extensions/garfex/composition/createPiSurface.ts` — `_keybindings` unused; `.pi/extensions/garfex/hosts/pi/PiPresentation.ts` — `buildHome()`/`buildResources()` hard-coded hints; `hosts/pi/PiResourcesPresentation.ts` — hard-coded hints; installed `docs/extensions.md` — Keybinding Hints and injected manager; installed `docs/keybindings.md` — customizable `tui.select.*` actions |
| Gap | Selection lacks a word-level state cue | `.pi/extensions/garfex/hosts/pi/PiPresentation.ts` — `createList()` uses native theme without added selected text; pinned `node_modules/@earendil-works/pi-tui/dist/components/select-list.js` — `renderItem()` uses `→` plus selected theme; installed `docs/tui.md` — native SelectList pattern |
| Verification gap | Edge-case matrix is incomplete | `.pi/extensions/garfex/hosts/pi/PiPresentation.test.ts` — five tests cover exact draft, Ctrl+C, Escape chain, widths, reopen cursor/focus but not combining/long/resize; `.pi/extensions/garfex/index.test.ts` — failure test but no diagnostic or retry-after-failure assertion |
| Satisfied | One native non-overlay Surface | `.pi/extensions/garfex/composition/createPiSurface.ts` — `openPiSurface()` calls `ui.custom` without overlay options; `.pi/extensions/garfex/hosts/pi/PiPresentation.ts` imports native components; `docs/decisions/0003-pi-ui-kit-v1.md`; installed `docs/tui.md` — `ctx.ui.custom()` and native component guidance |
| Satisfied | Draft/cursor/focus survive Search reopen | `.pi/extensions/garfex/hosts/pi/PiPresentation.ts` — retained `searchInput` field and `ResourcesExperience`; test `reopened search preserves the native Input draft, cursor, and focus`; pinned `input.js` — retained `value`/`cursor`, `CURSOR_MARKER` when focused |
| Satisfied | Back/cancel semantics are predictable | `.pi/extensions/garfex/hosts/pi/PiPresentation.ts` — `goBack()`, `returnToHome()`, native list `onCancel`; tests `native Ctrl+C cancel...` and `escape follows...`; `ResourcesExperience.test.ts` — cancellation navigation only |
| Satisfied with verification gap | Unicode, grapheme, long-input mechanics use pinned native Input | pinned `node_modules/@earendil-works/pi-tui/dist/components/input.js` — printable Unicode acceptance, `Intl.Segmenter`-backed grapheme movement/deletion, `visibleWidth`/`sliceByColumn` horizontal scrolling; `PiPresentation.test.ts` covers `ñ` but not combining/long cases |
| Satisfied | Narrow width never exceeds render width | `.pi/extensions/garfex/hosts/pi/PiPresentation.ts` — `render()` safe width and final `truncateToWidth`; test `native rendering stays within narrow widths`; pinned `text.js`, `box.js`, `dynamic-border.js`; installed `docs/tui.md` Line Width rule |
| Satisfied | Availability and IA are honest | `.pi/extensions/garfex/hosts/pi/PiMainMenu.ts`; `PiResourcesPresentation.ts` — `resourcesView()`; `PiResourcesPresentation.test.ts` — honest/no execution/useful affordances; `ResourcesExperienceState.ts` — only `search-unavailable` |
| Satisfied | Spanish product copy avoids internal jargon | `.pi/extensions/garfex/hosts/pi/PiRuntime.ts`; `PiMainMenu.ts`; `PiResourcesPresentation.ts`; `PiResourcesPresentation.test.ts` copy assertions; `index.test.ts` rejects `TUI` in notice |
| Satisfied | Safe command-level recovery and mode gating | `.pi/extensions/garfex/index.ts` — one `try/catch` around `openPiSurface()` and `mode !== "tui"` gate; `.pi/extensions/garfex/index.test.ts`; installed `docs/extensions.md` Mode Behavior; installed `docs/rpc.md` says `custom()` returns `undefined` in RPC |
| Satisfied | Pi presentation and feature boundary remain cohesive | `docs/architecture.md`; ADRs 0001–0003; `.pi/extensions/garfex/surface/features/resources/*`; `.pi/extensions/garfex/hosts/pi/*`; `tooling/architecture/check.mjs` rules `HEADLESS_HOST`, `FRONTEND_FRAMEWORK`, `FAKE_EXTERNAL_ARTIFACT`; `tooling/tests/architecture.test.mjs` |
| Satisfied | Pi APIs are pinned, not hypothetical | `package.json` and `package-lock.json` pin `@earendil-works/pi-coding-agent` and `@earendil-works/pi-tui` 0.84.2; audited installed `README.md`, `docs/extensions.md`, `docs/tui.md`, `docs/keybindings.md`, relevant RPC cross-reference, and examples `preset.ts`, `qna.ts`, `tools.ts`, `overlay-qa-tests.ts` |

## Minimal direction for the next phase

Limit the change to: (a) retain developer diagnostics while preserving the existing safe Spanish notification, (b) make interaction/selection guidance textual and consistent with Pi's active keybindings using existing Pi APIs, and (c) add focused regression tests for the uncovered edge cases. Preserve the current Surface structure and leave search execution/results/detail/create/auth and all integration contracts open.

## Audit limitations

The repository has a `.codegraph/` index, but this executor had neither CodeGraph MCP nor a shell/CLI surface, so targeted reads/grep were used after recording the fallback. The executor also could not run `npm test`, `npm run check:architecture`, `git status`, or dynamic terminal-resize scenarios. The 35-test statement is a source count (including generated fixture cases), not a fresh passing run. The dispatcher reports `nextRecommended: sdd-new`; proposal/spec/design/tasks remain blocked and were not created.
