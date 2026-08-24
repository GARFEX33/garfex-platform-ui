import type { ResourceRepository } from "../../application/ports/ResourceRepository";
import type { Resource } from "../../domain/resources/Resource";

export class InMemoryResourceRepository implements ResourceRepository {
    constructor(
        private readonly resources: Resource[],
    ) { }

    async searchActive(query: string): Promise<Resource[]> {
        const normalized = query.trim().toLocaleLowerCase("es-MX");

        return this.resources.filter(
            (resource) =>
                resource.active &&
                (!normalized ||
                    resource.name
                        .toLocaleLowerCase("es-MX")
                        .includes(normalized)),
        );
    }
}