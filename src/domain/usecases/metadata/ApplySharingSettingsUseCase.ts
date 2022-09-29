import _ from "lodash";
import { UseCase } from "../../../CompositionRoot";
import { FutureData } from "../../entities/Future";
import { isValidMetadataItem, MetadataItem, MetadataPayload } from "../../entities/MetadataItem";
import { buildAccessString, getAccessFromString, SharedObject, SharingSetting } from "../../entities/SharedObject";
import { SharingUpdate } from "../../entities/SharingUpdate";
import { MetadataRepository } from "../../repositories/MetadataRepository";

export class ApplySharingSettingsUseCase implements UseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    public execute(update: SharingUpdate): FutureData<MetadataPayload> {
        const { baseElements, excludedDependencies, sharings, replaceExistingSharings } = update;
        return this.metadataRepository
            .getDependencies(baseElements)
            .map(payload => this.cleanPayload(payload, excludedDependencies))
            .map(payload => this.sharePayload(payload, sharings, replaceExistingSharings));
    }

    private cleanPayload(payload: Record<string, any[]>, excludedDependencies: string[]): MetadataPayload {
        return _.mapValues(payload, (items, model) =>
            items.filter(
                item =>
                    isValidMetadataItem(item) &&
                    !excludedDependencies.includes(item.id) &&
                    this.metadataRepository.isShareable(model)
            )
        );
    }

    private sharePayload(payload: MetadataPayload, sharings: SharedObject, replace: boolean): MetadataPayload {
        return _.mapValues(payload, (items, model) =>
            items
                .map(item => this.updateSharingSettings(item, sharings, replace))
                .map(item => this.assertValidSharingSettings(model, item))
        );
    }

    private updateSharingSettings(item: MetadataItem, sharings: SharedObject, replace: boolean): MetadataItem {
        return {
            ...item,
            publicAccess: sharings.publicAccess,
            userAccesses: replace
                ? sharings.userAccesses
                : joinSharingSettings(sharings.userAccesses, item.userAccesses),
            userGroupAccesses: replace
                ? sharings.userGroupAccesses
                : joinSharingSettings(sharings.userGroupAccesses, item.userGroupAccesses),
        };
    }

    private assertValidSharingSettings(model: string, item: MetadataItem): MetadataItem {
        return {
            ...item,
            publicAccess: this.assertDataAccess(model, item.publicAccess),
            userAccesses: item.userAccesses.map(item => ({
                ...item,
                access: this.assertDataAccess(model, item.access),
            })),
            userGroupAccesses: item.userGroupAccesses.map(item => ({
                ...item,
                access: this.assertDataAccess(model, item.access),
            })),
        };
    }

    private assertDataAccess(model: string, permission: string): string {
        const access = getAccessFromString(permission);
        const stripDataPermissions = !this.metadataRepository.isDataShareable(model);
        return buildAccessString(access, stripDataPermissions);
    }
}

function joinSharingSettings(base: SharingSetting[], update: SharingSetting[]): SharingSetting[] {
    return _.uniqBy([...base, ...update], ({ id }) => id);
}
