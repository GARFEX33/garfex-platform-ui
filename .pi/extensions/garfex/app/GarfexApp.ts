import { SearchActiveResources } from "../application/use-cases/SearchActiveResources";
import { RESOURCE_MOCK_DATA } from "../infrastructure/data/resources.mock";
import { InMemoryResourceRepository } from "../infrastructure/repositories/InMemoryResourceRepository";
import { ResourcesModule } from "../modules/resources/ResourcesModule";
import type { UiPort } from "../ui/UiPort";
import { MainMenu } from "./MainMenu";

export class GarfexApp {
    private readonly mainMenu: MainMenu;

    constructor(ui: UiPort) {
        const resourceRepository =
            new InMemoryResourceRepository(RESOURCE_MOCK_DATA);

        const searchActiveResources =
            new SearchActiveResources(resourceRepository);

        const resourcesModule =
            new ResourcesModule(
                ui,
                searchActiveResources,
            );

        this.mainMenu = new MainMenu(
            ui,
            resourcesModule,
        );
    }

    async run(): Promise<void> {
        await this.mainMenu.open();
    }
}