# GARFEX Surface

This repository owns the human-facing **GARFEX Surface**. Pi is the first host, not the product's architectural identity.

## What works now

Run `/garfex` in Pi TUI mode to open one native, non-overlay Surface. The useful path is:

```text
GARFEX → Recursos maestros → Preparar búsqueda
```

The search view preserves the exact draft while you move back and return during that Surface lifetime. It does **not** execute a search or show fabricated Resources. Escape returns predictably from Search to Resources to GARFEX, then closes.

## Verify

Requires Node `>=22.19` and the locked npm dependencies.

```text
npm test
npm run check:architecture
```

The baseline exists only to load Pi 0.84.2 and run Node-native tests. It does not select a compiler, linter, formatter, bundler, or CI system.

## Architecture decisions

1. [`docs/architecture.md`](docs/architecture.md) — current materialized structure and review path.
2. [ADR 0001](docs/decisions/0001-garfex-surface-foundation.md) — Surface foundation.
3. [ADR 0002](docs/decisions/0002-independent-external-client-boundary.md) — independent external-client boundary.
4. [ADR 0003](docs/decisions/0003-pi-ui-kit-v1.md) — Pi-native rendering and interaction conventions.
5. [`AGENTS.md`](AGENTS.md) — contributor constraints.
