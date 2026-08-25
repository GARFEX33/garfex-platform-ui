# GARFEX Surface repository

## Identity and authority

This repository owns the human-facing **GARFEX Surface**. Pi is the current host, not the architecture. The Surface is an untrusted independent external client; read [ADR 0002](docs/decisions/0002-independent-external-client-boundary.md) before integration work.

Never invent Resource data, DTOs, contracts, auth, permissions, remote state, business rules, loaders, repositories, or fake requests. Do not import backend source, schemas, generated bindings, private packages, sibling workspaces, or `@garfex/*` artifacts.

## Implementation boundaries

```text
Pi entry/composition → hosts/pi presentation → surface feature
```

- Reusable features own interaction state, projections, and semantic intents.
- Hosts own rendering, focus, accessibility mechanics, keyboard handling, and physical navigation.
- Navigation is not interaction. A feature may emit `return-home`; Pi decides the destination.
- Keep Pi imports under `hosts/pi/`, plus `index.ts` and `composition/` where required to register and construct the Pi Surface.
- Do not create `UiPort`, `HostPort`, generic widget/component APIs, frontend domain/application/repository layers, or mandatory adapter classes.
- Add a mapping only when presentation genuinely transforms feature meaning.

## Pi UI conventions

[ADR 0003](docs/decisions/0003-pi-ui-kit-v1.md) is authoritative. Use one non-overlay `ctx.ui.custom` Surface and actual Pi native components. Pi UI Kit means conventions, not a library. Do not build a parallel component framework or `GarfexSelectList`.

Keep Pi-visible product copy in Spanish and avoid architecture vocabulary in the product UI. Expose only useful, honest affordances. Essential status and navigation guidance must be textual, not color- or symbol-only. Preserve predictable back behavior and narrow-width safety.

Resources Search currently captures an exact draft only. Draft survives navigation during one Surface lifetime. Cancel is not failure, execution, or clear. Empty or whitespace input has no assigned business meaning.

Use one command-level recovery boundary for unexpected opening failures. Primary UX must be actionable and must not reveal sensitive technical details. TUI-only behavior must be reported honestly in other modes.

## Minimal tooling

The npm/Node baseline exists only to import Pi 0.84.2 and run native tests. Do not infer a compiler, linter, formatter, bundler, build, migration, or CI choice.

```text
npm test
npm run check:architecture
```

Read [the architecture map](docs/architecture.md), [ADR 0001](docs/decisions/0001-garfex-surface-foundation.md), [ADR 0002](docs/decisions/0002-independent-external-client-boundary.md), and [ADR 0003](docs/decisions/0003-pi-ui-kit-v1.md) before changing boundaries.
