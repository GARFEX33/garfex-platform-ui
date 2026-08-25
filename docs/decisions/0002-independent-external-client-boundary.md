# ADR 0002: Independent external client boundary

- **Status:** Accepted
- **Date:** 2026-08-24

## Context

The Surface needs a durable integration boundary without coupling this repository to backend source, packaging, schemas, generated code, or a sibling checkout. Calling the Surface a “GARFEX client” is not enough to establish any shared implementation artifact.

The canonical counterpart is the decision **“Independent external client boundary” (Accepted 2026-08-24) in the `garfex-platform` repository**. That repository/document identity is the reference; this ADR records only UI-owned consequences and does not reproduce the backend contract.

This decision supersedes any interpretation of [ADR 0001](0001-garfex-surface-foundation.md) that permits importing backend `public.ts` modules, consuming backend-owned source artifacts, or resolving integration through a sibling filesystem checkout. ADR 0001 remains authoritative for the Surface foundation.

## Decision

### Independent external client

`garfex-platform-ui` is an **untrusted external GARFEX client**. It remains independent from `garfex-platform` source, packages, schemas, and generated code. Shared contractual meaning does not mean shared implementation.

The sole cross-repository boundary is an explicitly public, external, client-facing contract established by GARFEX. A backend module's `public.ts` is an internal application/module boundary, not that external client-facing contract, and the Surface may not import it.

“GARFEX client” does not imply a backend-owned `@garfex/client`, shared package, shared schema, or generated binding. UI-owned adapters will implement the client side against public contract semantics only. No such adapter or contract artifact is selected or materialized by this decision.

### Contract artifact admission

A public contract artifact may be consumed only after a separate, explicit decision confirms that it is:

- public and client-facing;
- versioned;
- safe for an untrusted external client; and
- independent of backend source and private implementation.

No artifact is allowlisted now, including any `@garfex/*` package. A future SDK is a separate decision and requires an explicit architecture-gate update.

### Authority and visibility

`ActorContext`, trusted identity, roles, and capabilities remain server-side. The Surface may present authentication or denial outcomes but cannot establish trusted identity or perform final authorization.

Convex bindings, backend persistence, backend schemas, module internals, private packages, and generated backend code remain invisible to the Surface.

### Repository independence

Installing, typechecking, building, testing, running, and deploying this repository must not require:

- a sibling `garfex-platform` path or checkout;
- backend source or a workspace link;
- a Git submodule or Git dependency; or
- a backend-owned private package, schema, or generated binding.

The physical location of the Pi implementation remains open. It cannot be resolved by source-linking this repository into `garfex-platform` under this decision.

### Narrow enforcement

`tooling/architecture/check.mjs` enforces the current no-linkage boundary with Node's standard library. It scans only this repository, or an explicitly supplied fixture root; it never inspects the sibling repository. Controlled violations are excluded from the default repository scan.

Run:

```text
node tooling/architecture/check.mjs
node --test tooling/tests/architecture.test.mjs
```

This checker does **not** select a product package manager, runtime baseline, compiler, build, test runner, linter, formatter, or CI contract. It is a narrow architecture guard only.

## Consequences

- UI adapters must be Surface-owned and depend only on explicitly approved public contract semantics.
- Backend refactoring and persistence choices cannot become UI install or build inputs.
- Shared meaning may require independent representations until a client-safe artifact is explicitly approved.
- A future public artifact or SDK requires a new decision and checker/configuration change; none is implicitly permitted.
- Review and the checker reject sibling source links, backend imports, `@garfex/*` dependencies, escaping workspace/configuration paths, counterpart Git dependencies, escaping symlinks, and headless Surface imports of host runtime code.

## Open and out of scope

This ADR does not choose transport, schema representation, SDK, package registry, code generation, authentication, or Resource Search. It implements no client, adapter, feature, business DTO, or backend contract.
