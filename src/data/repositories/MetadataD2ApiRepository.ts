import i18n from "@eyeseetea/d2-ui-components/locales";
import _ from "lodash";
import { Future, FutureData } from "../../domain/entities/Future";
import { ImportResult, ImportStats } from "../../domain/entities/ImportResult";
import {
    DataDimensionItem,
    isValidModel,
    MetadataModel,
    MetadataPayload,
    Visualization,
} from "../../domain/entities/MetadataItem";
import { ListMetadataResponse, ListOptions, MetadataRepository } from "../../domain/repositories/MetadataRepository";
import { D2Api, D2ApiDefinition, MetadataResponse, Stats } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";
import { Instance } from "../entities/Instance";

interface FullMetadataResponse extends MetadataResponse {
    response?: MetadataResponse;
}

export class MetadataD2ApiRepository implements MetadataRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public list(options: ListOptions): FutureData<ListMetadataResponse> {
        const { model, page, pageSize, search, sorting = { field: "id", order: "asc" } } = options;

        return apiToFuture(
            //@ts-ignore: d2-api incorrectly guessing model with string access
            this.api.models[model].get({
                page,
                pageSize,
                paging: true,
                filter: { identifiable: search ? { token: search } : undefined },
                fields: { $owner: true },
                order: `${sorting.field}:${sorting.order}`,
            })
        );
    }

    public save(payload: MetadataPayload): FutureData<ImportResult> {
        return apiToFuture(this.api.metadata.post(payload)).map(response => buildMetadataImportResult(response));
    }

    public getDependencies(ids: string[]): FutureData<MetadataPayload> {
        return this.getMetadataWithChildren(ids)
            .flatMap(payloads => {
                const payload = mergePayloads(payloads);
                const extraIds = extractExtraDependencies(payload);
                if (extraIds.length === 0) return Future.success(payload);

                return this.fetchMetadata(extraIds).map(dependencies => mergePayloads([payload, dependencies]));
            })
            .map(payload => removeDefaults(payload));
    }

    public getMetadataWithChildren(ids: string[]): FutureData<MetadataPayload[]> {
        return this.fetchMetadata(ids).flatMap(payload => {
            const items = _(payload)
                .mapValues((items, key) => {
                    if (!Array.isArray(items) || !isValidModel(key)) return undefined;
                    return items.map(item => ({ model: key, id: item.id }));
                })
                .values()
                .flatten()
                .compact()
                .value();

            return Future.futureMap(items, ({ model, id }) => this.fetchMetadataWithDependencies(model, id));
        });
    }

    public getMetadataFromIds(ids: string[]): FutureData<MetadataPayload> {
        return this.fetchMetadata(ids).map(payload => mergePayloads([payload]));
    }

    public getModelName(model: string): string {
        return this.api.models[model as ModelIndex].schema.displayName ?? i18n.t("Unknown model");
    }

    public isShareable(model: string): boolean {
        return this.api.models[model as ModelIndex].schema.shareable ?? false;
    }

    public isDataShareable(model: string): boolean {
        return this.api.models[model as ModelIndex].schema.dataShareable ?? false;
    }

    private fetchMetadata(ids: string[]): FutureData<MetadataPayload> {
        return apiToFuture(this.api.get("/metadata", { filter: `id:in:[${ids.join(",")}]` }));
    }

    private fetchMetadataWithDependencies(model: MetadataModel, id: string): FutureData<MetadataPayload> {
        switch (model) {
            case "dataElementGroupSets":
                return this.getDataElementGroupSetWithDependencies(id);
            case "organisationUnitGroups":
                return this.getOrgUnitGroupDependencies(id);
            case "organisationUnitGroupSets":
                return this.getOrgUnitGroupSetWithDependencies(id);
            default:
                return apiToFuture<MetadataPayload>(this.api.get(`/${model}/${id}/metadata.json`));
        }
    }

    private getDataElementGroupSetWithDependencies(id: string): FutureData<MetadataPayload> {
        return apiToFuture(
            this.api.models.dataElementGroupSets.get({
                fields: {
                    $owner: true,
                    dataElementGroups: { $owner: true },
                },
                filter: { id: { eq: id } },
            })
        ).flatMap(response => {
            const d2Object = response.objects[0];
            if (!d2Object) return Future.success({});

            const { dataElementGroups, ...rest } = d2Object;
            return Future.success({
                dataElementGroups: dataElementGroups,
                dataElementGroupSets: [rest],
            });
        });
    }

    private getOrgUnitGroupDependencies(id: string): FutureData<MetadataPayload> {
        return apiToFuture(
            this.api.models.organisationUnitGroups.get({
                fields: {
                    $owner: true,
                    organisationUnits: { $owner: true },
                },
                filter: { id: { eq: id } },
            })
        ).flatMap(response => {
            const d2Object = response.objects[0];
            if (!d2Object) return Future.success({});

            const { organisationUnits, ...rest } = d2Object;
            return Future.success({
                organisationUnits: organisationUnits,
                organisationUnitGroups: [rest],
            });
        });
    }

    private getOrgUnitGroupSetWithDependencies(id: string): FutureData<MetadataPayload> {
        return apiToFuture(
            this.api.models.organisationUnitGroupSets.get({
                fields: {
                    $owner: true,
                    organisationUnitGroups: { $owner: true },
                },
                filter: { id: { eq: id } },
            })
        ).flatMap(response => {
            const d2Object = response.objects[0];
            if (!d2Object) return Future.success({});

            const { organisationUnitGroups, ...rest } = d2Object;
            return Future.success({
                organisationUnitGroups: organisationUnitGroups,
                organisationUnitGroupSets: [rest],
            });
        });
    }
}

export function mergePayloads(payloads: MetadataPayload[]): MetadataPayload {
    return _.reduce(
        payloads,
        (result, payload) => {
            _.forOwn(payload, (value, key) => {
                if (Array.isArray(value)) {
                    const existing = result[key] ?? [];
                    result[key] = _.uniqBy([...existing, ...value], ({ id }) => id);
                }
            });
            return result;
        },
        {} as MetadataPayload
    );
}

function removeDefaults(payload: MetadataPayload): MetadataPayload {
    return _.mapValues(payload, items => items.filter(({ code, name }) => code !== "default" && name !== "default"));
}

function extractExtraDependencies(payload: MetadataPayload): string[] {
    return _(payload)
        .mapValues((value, key) => {
            if (key === "visualizations") {
                return _.flatten(
                    value.map((element: Visualization) =>
                        _.flatMap(element.dataDimensionItems ?? [], (item: DataDimensionItem) => {
                            const indicator = item.indicator?.id;
                            const programIndicator = item.programIndicator?.id;
                            return _.compact([indicator, programIndicator]);
                        })
                    )
                );
            }

            return [];
        })
        .values()
        .flatten()
        .value();
}

function buildMetadataImportResult(response: FullMetadataResponse): ImportResult {
    const { status, stats, typeReports = [] } = response.response ?? response;

    const typeStats = typeReports.flatMap(({ klass, stats }) => formatStats(stats, getClassName(klass)));

    const messages = typeReports.flatMap(({ objectReports = [] }) =>
        objectReports.flatMap(({ uid: id, errorReports = [] }) =>
            _.take(errorReports, 1).map(({ mainKlass, errorProperty, message }) => ({
                id,
                type: getClassName(mainKlass),
                property: errorProperty,
                message: message,
            }))
        )
    );

    return {
        title: i18n.t("Metadata"),
        date: new Date(),
        status: status === "OK" ? "SUCCESS" : status,
        stats: [formatStats(stats), ...typeStats],
        errors: messages,
        rawResponse: response,
    };
}

function formatStats(stats: Stats, type?: string): ImportStats {
    return {
        ..._.omit(stats, ["created"]),
        imported: stats.created,
        type,
    };
}

function getClassName(className: string): string | undefined {
    return _(className).split(".").last();
}

type ModelIndex = keyof D2ApiDefinition["schemas"];
