import { FutureData } from "../entities/Future";
import { ImportResult } from "../entities/ImportResult";
import { MetadataItem, MetadataModel, MetadataPayload } from "../entities/MetadataItem";

export interface MetadataRepository {
    list(options: ListOptions): FutureData<ListMetadataResponse>;
    getDependencies(ids: string[]): FutureData<MetadataPayload>;
    getMetadataWithChildren(ids: string[]): FutureData<MetadataPayload[]>;
    getMetadataFromIds(ids: string[]): FutureData<MetadataPayload>;
    save(payload: MetadataPayload): FutureData<ImportResult>;
    getModelName(model: string): string;
    isShareable(model: string): boolean;
    isDataShareable(model: string): boolean;
}

export interface ListOptions {
    model: MetadataModel;
    page?: number;
    pageSize?: number;
    search?: string;
    sorting?: { field: string; order: "asc" | "desc" };
}

export interface ListMetadataResponse {
    objects: MetadataItem[];
    pager: Pager;
}

export interface Pager {
    page: number;
    pageSize: number;
    total: number;
}
