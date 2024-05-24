import _ from "lodash";
import { FutureData } from "../../entities/Future";
import { MetadataRepository } from "../../repositories/MetadataRepository";
import { CodedRef, MetadataPayload } from "../../entities/MetadataItem";
import { SharingWarning, SharingSummary, SharingPayload } from "../../entities/SharingSummary";
import { SharingUpdate } from "../../entities/SharingUpdate";
import { NamedRef } from "../../entities/Ref";

export class GetSharingSummaryUseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    public execute(update: SharingUpdate, payload: MetadataPayload): FutureData<SharingSummary> {
        const { baseElements, excludedDependencies } = update;

        return this.metadataRepository.getMetadataWithChildren(baseElements).flatMap(payloads => {
            const payloadsSummary = this.getPayloadsSummary(payloads, payload, excludedDependencies);
            const metadataWithDifferentSharing = this.getMetadataWithDifferentSharing(payloadsSummary, baseElements);
            const sharingWarnings = this.cleanMetadataSharing(metadataWithDifferentSharing, excludedDependencies);
            const sharingPayload = this.getSharingPayload(payload, excludedDependencies);

            return this.metadataRepository.getMetadataFromIds(excludedDependencies).flatMap(excludedPayload => {
                const excludedMetadata = this.getMetadataFromPayload(excludedPayload);

                return this.metadataRepository.getDependencies(baseElements).map(baseElementPayload => {
                    const baseElementMetadata = this.getMetadataFromPayload(baseElementPayload);
                    const excludedMdSummary = excludedMetadata.filter(excluded =>
                        baseElementMetadata.map(payload => payload.id).includes(excluded.id)
                    );

                    return {
                        excludedMetadata: excludedMdSummary,
                        sharingWarnings: sharingWarnings,
                        sharingPayload: sharingPayload,
                    };
                });
            });
        });
    }

    private getPayloadsSummary(
        d2Payloads: MetadataPayload[],
        updatedPayload: MetadataPayload,
        excludedDependencies: string[]
    ): MetadataPayload[] {
        const cleanedPayload = this.cleanPayload(updatedPayload);

        return d2Payloads.map(d2Payload => {
            const cleanedD2Payload = this.cleanPayload(d2Payload);

            return _.mapValues(cleanedD2Payload, (items, key) => {
                const mappingArray = cleanedPayload[key] || [];

                return items
                    .map(item => {
                        const existing = mappingArray.find(mappingItem => mappingItem.id === item.id);
                        return existing ? { ...item, sharing: existing.sharing } : item;
                    })
                    .filter(payload => !excludedDependencies.includes(payload.id) && !isDefaultElement(payload));
            });
        });
    }

    private getMetadataFromPayload(payload: MetadataPayload): NamedRef[] {
        const cleanedPayload = _.pickBy(payload, (_items, model) => this.metadataRepository.isShareable(model));

        return _(cleanedPayload)
            .values()
            .flatten()
            .map(metadataItem => ({ id: metadataItem.id, name: metadataItem.name }))
            .value();
    }

    private cleanPayload(payload: MetadataPayload): MetadataPayload {
        return _.pickBy(payload, value => _.isArray(value) && !_.isEmpty(value));
    }

    private getSharingPayload(payload: MetadataPayload, excludedDependencies: string[]): SharingPayload {
        const sharingPayload = _(payload)
            .mapKeys((_, key) => this.metadataRepository.getModelName(key))
            .mapValues(payloads =>
                _(payloads)
                    .map(payload => ({ id: payload.id, name: payload.name, code: payload.code }))
                    .uniqBy("id")
                    .filter(payload => !excludedDependencies.includes(payload.id) && !isDefaultElement(payload))
                    .value()
            )
            .value();

        return _.pickBy(sharingPayload, value => !_.isEmpty(value));
    }

    private cleanMetadataSharing(
        metadataSharingWithChildren: SharingWarning[],
        excludedDependencies: string[]
    ): SharingWarning[] {
        return metadataSharingWithChildren
            .map(item => {
                const children = item.children.filter(child => {
                    const childSharing = {
                        userGroups: child.sharing.userGroups,
                        users: child.sharing.users,
                        public: child.sharing.public,
                    };
                    const parentSharing = {
                        userGroups: item.sharing.userGroups,
                        users: item.sharing.users,
                        public: item.sharing.public,
                    };

                    return (
                        !_.isEqual(childSharing, parentSharing) &&
                        !excludedDependencies.includes(child.id) &&
                        !isDefaultElement(child)
                    );
                });

                return {
                    ...item,
                    children: children,
                };
            })
            .filter(item => !_.isEmpty(item.children) && !excludedDependencies.includes(item.id));
    }

    private getMetadataWithDifferentSharing(payload: MetadataPayload[], parentIds: string[]): SharingWarning[] {
        return _(payload)
            .flatMap(payloadGroup =>
                parentIds.map(parentId => {
                    const parentItem = _(Object.values(payloadGroup))
                        .flatten()
                        .value()
                        .find(({ id }) => id === parentId);
                    const children = _(Object.values(payloadGroup))
                        .flatten()
                        .value()
                        .filter(({ id, sharing }) => id && sharing && id !== parentId);

                    return parentItem
                        ? {
                              id: parentItem.id,
                              name: parentItem.name,
                              code: parentItem.code,
                              sharing: parentItem.sharing,
                              children: children.map(child => ({
                                  id: child.id,
                                  name: child.name,
                                  code: child.code,
                                  sharing: child.sharing,
                              })),
                          }
                        : undefined;
                })
            )
            .compact()
            .value();
    }
}

const isDefaultElement = (metadataElement: CodedRef) => {
    return metadataElement.name === "default" || metadataElement.code === "default";
};
