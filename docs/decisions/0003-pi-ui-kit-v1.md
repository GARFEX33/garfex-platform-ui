# ADR 0003: GARFEX Pi UI Kit v1

- **Status:** Accepted
- **Date:** 2026-08-24

## Decision

GARFEX uses one non-overlay `ctx.ui.custom` Surface in Pi TUI mode. Pi's own `SelectList`, `Input`, containers, text, borders, keyboard matching, and width helpers are the renderer. **Pi UI Kit** names the conventions and architecture in this decision; it is not a component library or a second widget framework.

The reusable unit is feature state plus projections and semantic intents. Presentation remains host-specific. Navigation and interaction are distinct: Resources expresses `return-home` as an effect, while the Pi presentation decides which physical view receives focus. Search draft is exact interaction state for one Surface lifetime; leaving Search does not clear it, cancellation does not execute anything, and blank input receives no business meaning.

Only honest affordances are shown. Search captures a draft and states that execution is unavailable. No Resource data, client contract, transport, authentication, permissions, business rules, or loader is simulated.

The command opens this UI only in TUI mode. Non-TUI invocation reports that limitation. One command-level recovery boundary presents a Spanish actionable fallback without exposing technical details.

## Dependency and tooling consequences

- Pi package imports stay in `hosts/pi/`, the Pi entry point, and its composition edge. Reusable `surface/` features cannot import Pi or host code.
- Feature-specific mappings are allowed where they transform a projection into Pi-visible copy or choices. Generic UI ports, widget APIs, frontend domain/application/repository layers, and fake backend-shaped artifacts are rejected.
- The minimal execution baseline is npm metadata for Node `>=22.19`, exact Pi `0.84.2` dependencies, Node's native TypeScript type stripping, and Node's test runner. No compiler, linter, formatter, bundler, or CI choice is made.

## Consequences

Native behavior and key semantics remain aligned with Pi, narrow terminals receive width-aware rendering, and another host can reuse Resources state without inheriting Pi presentation. The trade-off is deliberate host-local presentation code rather than a cross-host component abstraction.

ADR 0001 remains authoritative for the Surface foundation and ADR 0002 for the independent external-client boundary.
