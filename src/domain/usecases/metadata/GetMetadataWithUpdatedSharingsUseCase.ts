import _ from "lodash";
import { UseCase } from "../../../CompositionRoot";
import { FutureData } from "../../entities/Future";
import { isValidMetadataItem, MetadataItem, MetadataPayload, SharingItem } from "../../entities/MetadataItem";
import { buildAccessString, getAccessFromString, SharedObject, SharingSetting } from "../../entities/SharedObject";
import { SharingUpdate } from "../../entities/SharingUpdate";
import { MetadataRepository } from "../../repositories/MetadataRepository";

export class GetMetadataWithUpdatedSharingsUseCase implements UseCase {
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
        const sharing = item.sharing || {};
        const { users, userGroups } = sharing;
        const updatedUserGroupAccesses = getUpdatedAccesses(
            replace,
            sharings.userGroupAccesses,
            userGroups ?? item.userGroupAccesses
        );
        const updatedUserAccesses = getUpdatedAccesses(replace, sharings.userAccesses, users ?? item.userAccesses);

        return {
            ...item,
            sharing: {
                ...sharing,
                public: sharings.publicAccess,
                userGroups: transformSharingSettings(updatedUserGroupAccesses),
                users: transformSharingSettings(updatedUserAccesses),
            },
            publicAccess: sharings.publicAccess,
            userAccesses: updatedUserAccesses,
            userGroupAccesses: updatedUserGroupAccesses,
        };
    }

    private assertValidSharingSettings(model: string, item: MetadataItem): MetadataItem {
        const { userGroups, users, public: publicAccess } = item.sharing;

        return {
            ...item,
            sharing: {
                ...item.sharing,
                public: this.assertDataAccess(model, publicAccess),
                userGroups: _.mapValues(userGroups, userGroup => ({
                    ...userGroup,
                    access: this.assertDataAccess(model, userGroup.access),
                })),
                users: _.mapValues(users, user => ({
                    ...user,
                    access: this.assertDataAccess(model, user.access),
                })),
            },
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

function joinSharingSettings(base: SharingSetting[], update: SharingSetting[] | SharingItem): SharingSetting[] {
    const updateArray = _.isArray(update) ? update : Object.values(update);

    return _.uniqBy([...base, ...updateArray], ({ id }) => id);
}

function getUpdatedAccesses(
    replace: boolean,
    base: SharingSetting[],
    update: SharingSetting[] | SharingItem
): SharingSetting[] {
    return replace ? base : joinSharingSettings(base, update);
}

function transformSharingSettings(sharingSettings: SharingSetting[]): SharingItem {
    return _(sharingSettings)
        .keyBy("id")
        .mapValues(value => value)
        .value();
}
