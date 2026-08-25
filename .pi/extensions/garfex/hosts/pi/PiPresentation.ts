import {
    DynamicBorder,
    getSelectListTheme,
    type Theme,
} from "@earendil-works/pi-coding-agent";
import {
    Box,
    Container,
    Input,
    Key,
    matchesKey,
    SelectList,
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
} from "./PiResourcesPresentation.ts";

type SurfaceLocation = "home" | "resources" | "search";
type SurfaceChoice = GarfexHomeChoice | ResourcesChoice;

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
        privateDone: () => void,
    ) {
        this.tui = privateTui;
        this.theme = privateTheme;
        this.done = privateDone;
        this.searchInput.onEscape = () => this.goBack();
        this.rebuild();
    }

    private readonly tui: TUI;
    private readonly theme: Theme;
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
        if (matchesKey(data, Key.escape)) {
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
        if (transition.effects.some((effect) => effect.kind === "return-home")) {
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
        content.addChild(
            new Text("Elige una opción disponible.", 0, 0),
        );
        content.addChild(new Spacer(1));

        const list = this.createList(GARFEX_HOME_ITEMS);
        list.onSelect = (item) => this.choose(item.value as GarfexHomeChoice);
        list.onCancel = () => this.done();
        content.addChild(list);
        content.addChild(new Spacer(1));
        content.addChild(
            new Text(
                this.theme.fg(
                    "muted",
                    "↑/↓: mover · Enter: elegir · Esc: cerrar GARFEX",
                ),
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
            content.addChild(new Text("Borrador de búsqueda", 0, 0));
            content.addChild(this.searchInput);
            this.active = this.searchInput;
        } else {
            const list = this.createList([...view.items]);
            list.onSelect = (item) => this.choose(item.value as ResourcesChoice);
            list.onCancel = () => this.returnToHome();
            content.addChild(list);
            this.active = list;
        }

        content.addChild(new Spacer(1));
        content.addChild(new Text(this.theme.fg("muted", view.hint), 0, 0));
    }

    private createList(items: typeof GARFEX_HOME_ITEMS): SelectList {
        return new SelectList(items.map((item) => ({ ...item })), items.length, getSelectListTheme(), {
            minPrimaryColumnWidth: 1,
            truncatePrimary: ({ text, maxWidth }) =>
                truncateToWidth(text, Math.max(1, maxWidth)),
        });
    }
}
