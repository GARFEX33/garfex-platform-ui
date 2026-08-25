# ADR 0001: GARFEX Platform UI — Arquitectura de Surface v1, CORREGIDA-4

- **Status:** Accepted
- **Date:** 2026-08-24

## Context

GARFEX needs a human-facing Surface that can support multiple hosts without moving backend authority into frontend code. The repository previously looked like a Pi extension prototype with a duplicated Resource model, repository/use-case abstractions, and runtime mock data. That shape falsely implied business and integration authority.

This decision establishes the enduring UI-owned foundation. Pi is the current first host implementation only. The physical code being under `.pi/extensions/garfex/` does **not** close the decision about the long-term physical location of Pi code.

[ADR 0002](0002-independent-external-client-boundary.md) supersedes any reading of this ADR that permits backend `public.ts` imports, backend-owned shared implementation, or sibling filesystem/source linkage. This ADR remains authoritative for the Surface foundation. Under ADR 0002, the physical-location question cannot be resolved by source-linking into `garfex-platform`.

Backend-owned policy stays canonical in the `garfex-platform` repository. The stable counterpart for the external boundary is its **“Independent external client boundary” decision (Accepted 2026-08-24)**; this repository does not depend on relative sibling documentation paths.

## Decision

### 1. Surface shape and presentation

GARFEX Surface is **feature-oriented and headless**. Each feature owns host-neutral experience intent, interaction transitions, and projections. Each host owns concrete presentation: rendering, input mechanics, host accessibility APIs, and physical navigation.

Semantic navigation and physical navigation are separate:

- a headless feature may express intents such as search, create, browse, or return home;
- a Pi, Web, mobile, or desktop presentation decides how those intents map to menus, routes, focus, back actions, and exit behavior.

There is no universal `HostPort`, generic `UiPort`, or mandatory host abstraction. Repetition across hosts is preferable to a premature lowest-common-denominator interface. Reversible host-local helpers are allowed.

### 2. State ownership

| State kind | Owner |
| --- | --- |
| **Business State** | GARFEX backend modules. The Surface never becomes authoritative for invariants, persistence, authorization, or business lifecycle. |
| **Remote State** | A future GARFEX client integration may own request lifecycle, synchronization, and caching. It is absent today. |
| **Interaction State** | Headless Surface features own host-neutral intent and projections; host-only ephemeral mechanics stay in the host. |

Derived display state should be projected rather than duplicated. State shared between features requires demonstrated shared interaction semantics, not convenience.

### 3. Resources and client capabilities

The Resources feature currently models frontend experience only. It may expose semantic search, create, browse, and return-home intent and an explicit client-capability-unavailable status. It must not define Resource business DTOs, backend/domain entities, backend errors, repositories, use cases, transport/SDK/Convex adapters, `ActorContext`, authorization, or fake results.

Future external dependencies must be **capability-shaped, narrow dependency views** derived from an explicitly public, external, versioned, client-safe GARFEX contract. The Surface may narrow public semantics for a feature through a UI-owned adapter; it may not import backend module `public.ts`, backend source, schemas, generated bindings, private packages, or an implicitly assumed `@garfex/client`. Until the real boundary exists, absence is represented explicitly rather than mocked.

There is no duplicated backend/domain/repository authority in this repository. Convex or any persistence technology is not a Surface contract.

### 4. Errors and empty results

The Surface keeps these categories distinct:

1. **interaction/input validation** — actionable feedback owned by the form or host experience;
2. **business/public application errors** — received from a future real GARFEX client contract without redefining their authority;
3. **authentication/authorization outcomes** — usability presentation only; enforcement remains server-side;
4. **transport/integration failures** — connectivity, timeout, or unavailable capability states;
5. **unexpected host/client failures** — safe fallback presentation and diagnostics without leaking sensitive details.

A future successful search with zero results is an empty state. It remains distinct from a backend/public application error, transport or integration failure, or Surface failure.

Whether an empty query is accepted, and what it means if accepted, remain governed by the future real GARFEX client-facing contract and UX design. This ADR assigns no search or browse semantics to empty input; browse remains its own explicit intent.

### 5. Forms and validation

The Surface owns form composition, field interaction, accessibility, local formatting, and immediate input validation needed for usability. A host may adapt those semantics to its controls. GARFEX backend contracts remain authoritative for accepted input, business validation, invariants, and final outcomes.

Client validation must not copy business rules as an independent source of truth. Where a real GARFEX client contract later publishes constraints, Surface validation may consume or faithfully project them. Server errors still require first-class presentation.

### 6. Accessibility

Accessibility is required in every host. Headless features expose enough semantics for meaningful labels, states, errors, progress, and operation outcomes. Hosts must implement keyboard or equivalent navigation, predictable focus/return behavior, readable status announcements, and non-color-only feedback using their native capabilities. Accessibility mechanics remain host-specific rather than forcing a universal host API.

### 7. Dependencies and shared discipline

Allowed direction:

```text
host presentation
    -> headless Surface feature
    -> future narrow view of an explicitly public external contract
    -> UI-owned client adapter and transport/composition edge
    -> GARFEX external client-facing boundary
```

Composition may know concrete hosts and features but only wires them. Shared code is admitted only after repeated, stable Surface semantics are demonstrated. `shared/` must not become a dumping ground, a parallel domain, a universal host layer, or a home for speculative DTOs. Prefer feature ownership and host-local duplication until the common concept is proven.

Prohibited dependencies and authority:

```text
headless feature -> Pi/Web/host runtime
Surface -> backend module internals or persistence
Surface -> Convex/Temporal/Agent Platform/Harness internals
Surface -> trusted ActorContext construction or final authorization
backend module/domain -> Surface or Pi
deterministic operation -> LLM, Harness, or Agent Platform
composition -> business or interaction behavior
runtime -> fake GARFEX client capability or fake business results
```

### 8. Deterministic and future agentic routes

Search, CRUD, catalog reads, forms, and navigation are deterministic and must use the direct future GARFEX client-facing route. They must not require an LLM, Harness, Agent Platform, or agentic execution.

Future agentic behavior is a separate route and remains unimplemented. Surface/UI is not a Harness. If a product later contains both roles, they remain logically and replaceably separate.

Temporal and Agent Platform are backend-owned concerns. The only UI consequence accepted here is that the Surface must not import or control their internals. If future public client contracts expose long-running status, cancellation, or agentic capabilities, the Surface may present those capabilities through the same narrow-contract discipline. This ADR does not define workflow semantics, Agent Platform design, Harness selection, models, tools, or event transport.

### 9. Authentication and authorization consequences

The Surface may collect login input and present session or denial states after an auth strategy is selected, but it never establishes trusted identity or final authorization. Trusted actor context is created server-side, client identity fields are not authoritative, and Resource Master performs capability authorization. There is no direct persistence fallback or temporary auth bypass.

This ADR selects no login UX, identity provider, productive authentication strategy, role model, or client auth transport.

## Consequences

### Positive

- Hosts can evolve without changing headless experience intent or GARFEX business modules.
- Business authority, trusted identity, and final authorization stay server-owned.
- Deterministic operations avoid agentic cost, latency, and failure modes.
- Missing integration is visible and honest; runtime mocks cannot masquerade as progress.
- Feature ownership and narrow contracts constrain coupling.
- Accessibility and error semantics are explicit responsibilities.

### Costs and trade-offs

- Pi presentation contains host-specific repetition that a universal abstraction might superficially reduce.
- Real Resource behavior cannot proceed until client-facing contracts and transport are selected and materialized.
- Multiple state categories and error categories require deliberate mapping at future integration edges.
- Each host must implement and verify its own physical navigation and accessibility realization.
- The narrow standard-library architecture checker enforces selected dependency rules, while broader package/build tooling remains undecided.

## Open decisions

[ADR 0003](0003-pi-ui-kit-v1.md) resolved only the minimal current baseline: npm metadata, Node `>=22.19`, exact Pi `0.84.2` dependencies, native TypeScript type stripping, and Node's native test runner. Compiler, linter, formatter, bundler, CI, and broader package/build choices remain open.

This ADR deliberately leaves all of the following open:

- the physical Surface↔GARFEX transport/composition edge (HTTP, RPC, SDK, Convex transport, in-process, out-of-process, or another choice);
- the real Resource client-facing contracts, their DTOs, public errors, capability shape, and versioning;
- productive authentication strategy, identity provider, session transport, auth/login experience, and account recovery;
- Web or other host implementation and framework;
- compiler, linter, formatter, bundler, CI, and broader package/build choices beyond ADR 0003's minimal current baseline;
- Remote State/cache/request library and synchronization policy;
- forms library, schema/validation library, and contract-driven constraint mechanism;
- routing/navigation libraries, localization framework, styling/design system, telemetry, logging, and diagnostics;
- any architecture enforcement beyond the materialized narrow repository-independence and headless dependency checker;
- detailed accessibility test tooling and host-specific acceptance criteria;
- first real Harness and its repository/location;
- Agent Platform internals, GARFEX-controlled agent capability contracts, tools, model/provider, approval UX, execution, event transport, and observability;
- Temporal-facing public status/cancellation contracts and their UI semantics; and
- the cross-repository physical location of Pi Surface code.

The current physical Pi code location in this repository is an implementation fact, not resolution of the final physical-location decision. ADR 0002 prohibits resolving that decision through source/path/workspace linkage into `garfex-platform`.
