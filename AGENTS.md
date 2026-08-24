# AGENTS.md

## Project

Pi coding agent extension (`@earendil-works/pi-coding-agent`). Registers a `garfex` command via `.pi/extensions/garfex/index.ts`. Not a standalone app — runs inside the Pi agent runtime.

## Architecture

Hexagonal (ports & adapters). Layer boundaries are strict — inner layers never import outer layers.

```
domain/          → entities & value types (no imports from other layers)
application/     → use cases + port interfaces (imports domain only)
infrastructure/  → repository impls, mock data, external adapters
ui/              → UiPort interface + PiUiAdapter (bridges Pi's ExtensionCommandContext)
modules/         → feature controllers that wire UI ↔ use cases
app/             → composition root (GarfexApp wires everything, MainMenu routes)
index.ts         → extension entry point, registers the "garfex" command
```

Dependency direction: `index.ts → app → modules → application → domain`. Infrastructure implements application ports. UI is a port implemented by `PiUiAdapter`.

## Key facts

- **No build, test, lint, or typecheck tooling** in this repo. The Pi runtime handles compilation.
- **Single external dependency**: `@earendil-works/pi-coding-agent` (types for `ExtensionAPI`, `ExtensionCommandContext`).
- **UI strings are in Spanish** — preserve this when extending menus or notifications.
- **`.atl/`** is gitignored — local skill registry cache, do not commit.
- **Mock data only** — `InMemoryResourceRepository` is seeded from `resources.mock.ts`. No real backend yet.
- **Search uses `es-MX` locale** for case-insensitive matching (`toLocaleLowerCase("es-MX")`).

## Adding a new feature module

1. Define domain types in `domain/<feature>/`
2. Define port interfaces in `application/ports/`
3. Implement use cases in `application/use-cases/` (or `application/ports/use-cases/`)
4. Add infrastructure impls in `infrastructure/`
5. Create a module controller in `modules/<feature>/` that takes `UiPort` + use cases
6. Wire it in `app/GarfexApp.ts` constructor and expose via `MainMenu`
