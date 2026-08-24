# GARFEX Surface repository

## Identity

This repository owns **GARFEX Surface**: the human-facing experience layer. It is not the GARFEX backend, a business module, an agent Harness, or a Pi extension as its architectural identity. Pi is only the current first host implementation, physically materialized under `.pi/extensions/garfex/`.

There is no selected technical baseline or repository tooling: no package manifest, compiler configuration, test runner, linter, formatter, build, or CI contract exists here. Do not infer or add one without an explicit decision.

## Ownership and dependency direction

```text
host presentation (currently Pi)
        ↓
headless Surface feature experience
        ↓
future narrow GARFEX client-facing capability contracts (absent today)
        ↓
GARFEX transport/composition edge and backend-owned public contracts
```

- Feature code owns host-neutral interaction intent, projections, and **Interaction State**.
- Host presentation owns rendering, input mechanisms, accessibility realization, and physical navigation.
- A future GARFEX client integration may own **Remote State** caching and request lifecycle state.
- GARFEX backend modules remain authoritative for **Business State**, business rules, authorization, public business errors, and persistence.
- Semantic navigation intent belongs to headless features; physical navigation belongs to each host.
- Composition roots only wire concrete pieces.

Only introduce capability-shaped dependency views when they derive from real GARFEX client-facing contracts. Keep them narrow and feature-oriented. Do not invent a universal `HostPort` or a generic UI port.

## Forbidden dependencies and authority

Never make the Surface:

- define or duplicate backend domain entities, business DTO authority, repositories, use cases, business rules, or authorization;
- import backend module internals, persistence, Convex internals, Temporal internals, Agent Platform internals, or Harness internals;
- construct or trust `ActorContext`, client-supplied identity, roles, or capabilities;
- provide fake repositories, mock business results, or a fake GARFEX client capability at runtime;
- route deterministic CRUD, search, forms, or navigation through an LLM, Harness, or Agent Platform; or
- make GARFEX modules depend on Pi or any Surface host.

A client-side guard may improve usability but is never authorization. Trusted actor context is server-created and the owning GARFEX module performs final authorization.

## Current Resources limitation

The Resources feature currently models only experience intent and explicitly reports that the GARFEX client capability is unavailable. Resource client contracts and Surface↔GARFEX transport do not exist here yet. Do not add Resource DTOs, backend error replicas, transport adapters, mock results, or direct backend imports to bypass that absence.

## Pi host conventions

- Keep Pi-specific types and runtime calls under `hosts/pi/` (plus the Pi entry point and composition root).
- Pi presentation invokes headless feature operations and implements physical return/exit behavior itself.
- Preserve all Pi-visible menu, prompt, and notification strings in Spanish.
- A future host gets its own presentation; it does not force a universal host abstraction.

Read [`docs/architecture.md`](docs/architecture.md) for materialized code and [`docs/decisions/0001-garfex-surface-foundation.md`](docs/decisions/0001-garfex-surface-foundation.md) for accepted direction and open decisions.
