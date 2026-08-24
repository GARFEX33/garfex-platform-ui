import type { Resource } from "../../domain/resources/Resource";

export interface ResourceRepository {
    searchActive(query: string): Promise<Resource[]>;
}