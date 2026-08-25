# GARFEX Surface

This repository is the human-facing **GARFEX Surface** workspace. Pi is the current first host implementation, not the product's architectural identity and not an agent Harness.

## Materialized now

- a host-neutral Resources experience that models semantic interaction intent and an explicit client-capability-unavailable state;
- Pi-specific menus, prompts, notifications, and physical navigation;
- a Pi-only composition root and `/garfex` extension entry point; and
- architecture guidance, the accepted Surface foundation decision, and the accepted independent external client boundary; and
- a narrow standard-library architecture checker that prevents source/package/workspace linkage to backend internals.

No real Resources data is shown. The GARFEX Resources client capability and Surface↔GARFEX transport are intentionally absent—not mocked. The checker does not select a product package, build, typecheck, test, lint, formatting, or CI baseline; those baselines remain undecided.

## Architecture guide

1. Read [`docs/architecture.md`](docs/architecture.md) for the exact implemented structure and dependency diagram.
2. Read [ADR 0001](docs/decisions/0001-garfex-surface-foundation.md) for the Surface foundation.
3. Read [ADR 0002](docs/decisions/0002-independent-external-client-boundary.md) for the source/package-independent external client boundary.
4. Read [`AGENTS.md`](AGENTS.md) before extending the code.

## Architecture check

Run the standalone guard directly with Node:

```text
node tooling/architecture/check.mjs
node --test tooling/tests/architecture.test.mjs
```

It scans only this repository (or an explicitly supplied fixture root), uses no third-party packages, and does not establish the future product tooling baseline.
