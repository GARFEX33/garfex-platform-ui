import type { Resource } from "../../domain/resources/Resource";
import type { ResourceRepository } from "../ports/ResourceRepository";

export class SearchActiveResources {
    constructor(
        private readonly repository: ResourceRepository,
    ) { }

    async execute(query: string): Promise<Resource[]> {
        return this.repository.searchActive(query.trim());
    }
}
