import {
    DynamicBorder,
    getSelectListTheme,
    keyHint,
    keyText,
    type KeybindingsManager,
    type Theme,
} from "@earendil-works/pi-coding-agent";
import {
    Box,
    Container,
    Input,
    SelectList,
    setKeybindings,
    Spacer,
    Text,
    truncateToWidth,
    type Component,
    type Focusable,
    type TUI,
} from "@earendil-works/pi-tui";

import { ResourcesExperience } from "../../surface/features/resources/ResourcesExperience.ts";
import { GARFEX_HOME_ITEMS, type GarfexHomeChoice } from "./PiMainMenu.ts";
import {
    resourcesView,
    type ResourcesChoice,
    type ResourcesHint,
} from "./PiResourcesPresentation.ts";

type SurfaceLocation = "home" | "resources" | "search";
type SurfaceChoice = GarfexHomeChoice | ResourcesChoice;
type SelectAction =
    | "tui.select.up"
    | "tui.select.down"
    | "tui.select.confirm"
    | "tui.select.cancel";

function configuredKeyText(
    keybindings: KeybindingsManager,
    action: SelectAction,
): string {
    return keybindings.getKeys(action).length > 0 ? keyText(action) : "";
}

function configuredKeyHint(
    keybindings: KeybindingsManager,
    action: SelectAction,
    description: string,
): string {
    return keybindings.getKeys(action).length > 0
        ? keyHint(action, description)
        : "";
}

function joinGuidance(fragments: readonly string[]): string {
    return fragments.filter((fragment) => fragment.length > 0).join(" · ");
}

function movementGuidance(
    keybindings: KeybindingsManager,
    description: string,
): string {
    const keys = [
        configuredKeyText(keybindings, "tui.select.up"),
        configuredKeyText(keybindings, "tui.select.down"),
    ]
        .filter((key) => key.length > 0)
        .join("/");
    return keys.length > 0 ? `${keys}: ${description}` : "";
}

export class GarfexSurfaceComponent implements Component, Focusable {
    focused = false;

    private readonly resources = new ResourcesExperience();
    private readonly container = new Container();
    private readonly searchInput = new Input();
    private location: SurfaceLocation = "home";
    private active: SelectList | Input | undefined;

    constructor(
        privateTui: TUI,
        privateTheme: Theme,
        privateKeybindings: KeybindingsManager,
        privateDone: () => void,
    ) {
        this.tui = privateTui;
        this.theme = privateTheme;
        this.keybindings = privateKeybindings;
        this.done = privateDone;
        setKeybindings(privateKeybindings);
        this.searchInput.onEscape = () => this.goBack();
        this.rebuild();
    }

    private readonly tui: TUI;
    private readonly theme: Theme;
    private readonly keybindings: KeybindingsManager;
    private readonly done: () => void;

    currentLocation(): SurfaceLocation {
        return this.location;
    }

    searchDraft(): string {
        return this.resources.project().searchDraft;
    }

    choose(choice: SurfaceChoice): void {
        if (this.location === "home") {
            if (choice === "resources") {
                this.location = "resources";
                this.rebuild();
            } else if (choice === "close") {
                this.done();
            }
            return;
        }

        if (this.location === "resources") {
            if (choice === "search") {
                this.resources.openSearch();
                this.location = "search";
                this.rebuild();
            } else if (choice === "back") {
                this.returnToHome();
            }
        }
    }

    handleInput(data: string): void {
        if (this.keybindings.matches(data, "tui.select.cancel")) {
            this.goBack();
            return;
        }

        this.active?.handleInput(data);
        if (this.active === this.searchInput) {
            const draft = this.searchInput.getValue();
            if (draft !== this.resources.project().searchDraft) {
                this.resources.changeSearchDraft(draft);
            }
        }
        this.tui.requestRender();
    }

    render(width: number): string[] {
        const safeWidth = Math.max(1, Math.floor(width));
        if (this.active === this.searchInput) {
            this.searchInput.focused = this.focused;
        }
        return this.container
            .render(safeWidth)
            .map((line) => truncateToWidth(line, safeWidth, ""));
    }

    invalidate(): void {
        this.container.invalidate();
    }

    private goBack(): void {
        if (this.location === "search") {
            this.resources.cancelSearch();
            this.location = "resources";
            this.rebuild();
        } else if (this.location === "resources") {
            this.returnToHome();
        } else {
            this.done();
        }
    }

    private returnToHome(): void {
        const transition = this.resources.returnHome();
        if (
            transition.effects.some((effect) => effect.kind === "return-home")
        ) {
            this.location = "home";
            this.rebuild();
        }
    }

    private rebuild(): void {
        this.container.clear();
        this.container.addChild(
            new DynamicBorder((text) => this.theme.fg("borderAccent", text)),
        );

        const content = new Box(1, 0);
        content.addChild(
            new Text(this.theme.fg("accent", this.theme.bold("GARFEX")), 0, 0),
        );
        content.addChild(new Spacer(1));

        if (this.location === "home") {
            this.buildHome(content);
        } else {
            this.buildResources(content);
        }

        this.container.addChild(content);
        this.container.addChild(
            new DynamicBorder((text) => this.theme.fg("borderAccent", text)),
        );
        this.container.invalidate();
        this.tui.requestRender();
    }

    private buildHome(content: Box): void {
        content.addChild(new Text(this.theme.bold("Inicio"), 0, 0));
        content.addChild(new Text("Elige una opción disponible.", 0, 0));
        content.addChild(new Spacer(1));

        const list = this.createList(GARFEX_HOME_ITEMS);
        list.onSelect = (item) => this.choose(item.value as GarfexHomeChoice);
        list.onCancel = () => this.done();
        content.addChild(list);
        content.addChild(new Spacer(1));
        content.addChild(
            new Text(
                this.theme.fg("muted", this.selectionGuidance("cerrar GARFEX")),
                0,
                0,
            ),
        );

        this.active = list;
    }

    private buildResources(content: Box): void {
        const projection = this.resources.project();
        const view = resourcesView(projection);
        content.addChild(new Text(this.theme.bold(view.title), 0, 0));
        content.addChild(new Text(view.description, 0, 0));
        content.addChild(new Spacer(1));

        if (projection.location === "search") {
            this.searchInput.focused = this.focused;
            content.addChild(
                new Text("Campo activo: borrador de búsqueda", 0, 0),
            );
            content.addChild(this.searchInput);

            this.active = this.searchInput;
        } else {
            const list = this.createList([...view.items]);
            list.onSelect = (item) =>
                this.choose(item.value as ResourcesChoice);
            list.onCancel = () => this.returnToHome();
            content.addChild(list);
            this.active = list;
        }

        content.addChild(new Spacer(1));
        content.addChild(
            new Text(
                this.theme.fg("muted", this.resourcesGuidance(view.hint)),
                0,
                0,
            ),
        );
    }

    private selectionGuidance(
        cancelDescription: string,
        movementDescription = "mover",
        confirmDescription = "elegir",
    ): string {
        return joinGuidance([
            movementGuidance(this.keybindings, movementDescription),
            configuredKeyHint(
                this.keybindings,
                "tui.select.confirm",
                confirmDescription,
            ),
            configuredKeyHint(
                this.keybindings,
                "tui.select.cancel",
                cancelDescription,
            ),
        ]);
    }

    private resourcesGuidance(hint: ResourcesHint): string {
        if (hint.kind === "search") {
            return joinGuidance([
                hint.typing,
                configuredKeyHint(
                    this.keybindings,
                    "tui.select.cancel",
                    hint.cancel,
                ),
            ]);
        }
        return this.selectionGuidance(hint.cancel, hint.movement, hint.confirm);
    }

    private createList(items: typeof GARFEX_HOME_ITEMS): SelectList {
        return new SelectList(
            items.map((item) => ({ ...item })),
            items.length,
            getSelectListTheme(),
            {
                truncatePrimary: ({ text, maxWidth, isSelected }) =>
                    truncateToWidth(
                        isSelected ? `Activa: ${text}` : text,
                        Math.max(1, maxWidth),
                        "",
                    ),
            },
        );
    }
}
