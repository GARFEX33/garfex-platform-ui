# GARFEX Surface

This repository is the human-facing **GARFEX Surface** workspace. Pi is the current first host implementation, not the product's architectural identity and not an agent Harness.

## Materialized now

- a host-neutral Resources experience that models semantic interaction intent and an explicit client-capability-unavailable state;
- Pi-specific menus, prompts, notifications, and physical navigation;
- a Pi-only composition root and `/garfex` extension entry point; and
- architecture guidance and the accepted Surface foundation decision.

No real Resources data is shown. The GARFEX Resources client capability and Surface↔GARFEX transport are intentionally absent—not mocked. This repository also has no selected package, build, typecheck, test, lint, formatting, or CI baseline.

## Architecture guide

1. Read [`docs/architecture.md`](docs/architecture.md) for the exact implemented structure and dependency diagram.
2. Read [ADR 0001](docs/decisions/0001-garfex-surface-foundation.md) for accepted direction, constraints, and open decisions.
3. Read [`AGENTS.md`](AGENTS.md) before extending the code.
