import { PiMainMenu } from "../hosts/pi/PiMainMenu";
import { PiPresentation } from "../hosts/pi/PiPresentation";
import type { PiCommandContext } from "../hosts/pi/PiRuntime";
import { PiResourcesPresentation } from "../hosts/pi/PiResourcesPresentation";
import { ResourcesExperience } from "../surface/features/resources/ResourcesExperience";

export function createPiSurface(context: PiCommandContext): PiMainMenu {
    const resources = new ResourcesExperience();
    const piPresentation = new PiPresentation(context);
    const resourcesPresentation = new PiResourcesPresentation(
        piPresentation,
        resources,
    );

    return new PiMainMenu(piPresentation, resourcesPresentation);
}
