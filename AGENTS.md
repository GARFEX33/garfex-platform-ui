# GARFEX Surface repository

## Identity

This repository owns **GARFEX Surface**: the human-facing experience layer. It is not the GARFEX backend, a business module, an agent Harness, or a Pi extension as its architectural identity. Pi is only the current first host implementation, physically materialized under `.pi/extensions/garfex/`.

There is no selected product technical baseline: no package manifest, compiler configuration, product test runner, linter, formatter, build, or CI contract exists here. The standalone Node architecture checker is the sole narrow repository tool; it does not select any of those baselines. Do not infer or add one without an explicit decision.

## Ownership and dependency direction

```text
host presentation (currently Pi)
        ↓
headless Surface feature experience
        ↓
future narrow view of an explicitly public external contract (absent today)
        ↓
UI-owned adapter and GARFEX external boundary (transport undecided)
```

- Feature code owns host-neutral interaction intent, projections, and **Interaction State**.
- Host presentation owns rendering, input mechanisms, accessibility realization, and physical navigation.
- A future GARFEX client integration may own **Remote State** caching and request lifecycle state.
- GARFEX backend modules remain authoritative for **Business State**, business rules, authorization, public business errors, and persistence.
- This repository is an untrusted external client. Shared contractual meaning never permits shared backend implementation, source, schemas, generated code, private packages, or backend module `public.ts` imports.
- UI-owned adapters may implement a client side only against an explicitly public, external, versioned, client-safe contract. No contract artifact or `@garfex/*` package is currently approved.
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
- make GARFEX modules depend on Pi or any Surface host;
- require a sibling backend checkout, source/path/workspace link, Git dependency, private package, schema, or generated backend binding; or
- import Pi/host runtime or `hosts/` code from headless `surface/` code.

A client-side guard may improve usability but is never authorization. Trusted actor context is server-created and the owning GARFEX module performs final authorization.

## Current Resources limitation

The Resources feature currently models only experience intent and explicitly reports that the GARFEX client capability is unavailable. Resource client contracts and Surface↔GARFEX transport do not exist here yet. Do not add Resource DTOs, backend error replicas, transport adapters, mock results, or direct backend imports to bypass that absence.

## Pi host conventions

- Keep Pi-specific types and runtime calls under `hosts/pi/` (plus the Pi entry point and composition root).
- Pi presentation invokes headless feature operations and implements physical return/exit behavior itself.
- Preserve all Pi-visible menu, prompt, and notification strings in Spanish.
- A future host gets its own presentation; it does not force a universal host abstraction.

## Architecture enforcement

Run `node tooling/architecture/check.mjs` and `node --test tooling/tests/architecture.test.mjs`. The standard-library checker scans only this repository or an explicitly supplied fixture root and never inspects a sibling checkout. A future approved public artifact requires an explicit decision and checker change; none is allowlisted now.

Read [`docs/architecture.md`](docs/architecture.md) for materialized code, [ADR 0001](docs/decisions/0001-garfex-surface-foundation.md) for the Surface foundation, and [ADR 0002](docs/decisions/0002-independent-external-client-boundary.md) for the independent external client boundary.
