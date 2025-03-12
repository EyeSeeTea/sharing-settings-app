import _ from "lodash";
import "lodash.product";
import { mergePayloads } from "../../../../data/repositories/MetadataD2ApiRepository";
import { Future, FutureData } from "../../../entities/Future";
import { ImportResult } from "../../../entities/ImportResult";
import { MetadataPayload } from "../../../entities/MetadataItem";
import { SharingUpdate } from "../../../entities/SharingUpdate";
import { ListMetadataResponse, ListOptions, MetadataRepository } from "../../../repositories/MetadataRepository";
import { GetMetadataWithUpdatedSharingsUseCase } from "../GetMetadataWithUpdatedSharingsUseCase";
import { metadata } from "./GetMetadataWithUpdatedSharingsUseCase.metadata";
import { SharingSetting } from "../../../entities/SharedObject";

describe("Get metadata with updated sharing settings use case", () => {
    let metadataRepository: MetadataRepository;
    let usecase: GetMetadataWithUpdatedSharingsUseCase;

    beforeAll(() => {
        metadataRepository = new MockMetadataRepository();
        usecase = new GetMetadataWithUpdatedSharingsUseCase(metadataRepository);
    });

    for (const update of buildTestCases()) {
        it(buildTitle(update), async () => {
            const { baseElements, excludedDependencies, sharings, replaceExistingSharings } = update;
            const { data: result, error } = await usecase.execute(update).runAsync();
            expect(error).toBeUndefined();
            const items = _(result).values().flatten().value();
            const itemIds = items.map(item => item.id);

            const metadata = await metadataRepository.getDependencies(baseElements).toPromise();
            const metadataItems = _(metadata).values().flatten().value();

            // Check excluded dependencies are not in the payload
            expect(_.intersection(itemIds, excludedDependencies)).toEqual([]);

            // Check public access has been updated
            expect(_.every(items, ({ publicAccess }) => publicAccess === sharings.publicAccess)).toBe(true);

            if (replaceExistingSharings) {
                // If strategy is replace, check that the sharings are replaced
                for (const item of items) {
                    expect(item.userAccesses).toEqual(sharings.userAccesses);
                    expect(item.userGroupAccesses).toEqual(sharings.userGroupAccesses);
                }
            } else {
                // If strategy is merge, check that the sharings are merged
                for (const item of items) {
                    const { sharing = { userGroups: {}, users: {} } } =
                        metadataItems.find(({ id }) => id === item.id) ?? {};

                    expect(processSharingSettings(item.userAccesses)).toEqual(
                        processSharingSettings(
                            _.uniqBy([...sharings.userAccesses, ..._.values(sharing.users)], ({ id }) => id)
                        )
                    );

                    expect(processSharingSettings(item.userGroupAccesses)).toEqual(
                        processSharingSettings(
                            _.uniqBy([...sharings.userGroupAccesses, ..._.values(sharing.userGroups)], ({ id }) => id)
                        )
                    );
                }
            }
        });
    }
});

function buildTitle(update: SharingUpdate): string {
    const { excludedDependencies, sharings, replaceExistingSharings } = update;
    const { publicAccess, userAccesses, userGroupAccesses } = sharings;

    const message = [
        excludedDependencies.length !== 0 ? "excluding elements" : "no excluding elements",
        publicAccess === "--------" ? "no public access" : "public access",
        userAccesses.length === 0 ? "no users" : "users",
        userGroupAccesses.length === 0 ? "no userGroups" : "userGroups",
        `${replaceExistingSharings ? "replace" : "merge"} strategy`,
    ].join(", ");

    return `Should apply sharing setting with ${message}`;
}

function buildTestCases(): SharingUpdate[] {
    //@ts-ignore Lodash product is not typed
    const product = _.product(
        //@ts-ignore Lodash product is not typed
        _.product(
            ["dataset1", "program1", "dashboard1"],
            ["dataset2", "program2", "dashboard2"],
            ["dataset3", "program3", "dashboard3"]
        ),
        ["exclude", "noexclude"],
        [true, false],
        ["user", "nouser"],
        ["usergroup", "nousergroup"],
        ["public", "nopublic"]
    );

    const user = [{ id: "s5EVHUwoFKu", access: "rw------", name: "Alexis Rico" }];
    const userGroup = [{ id: "sCjEPgiOhP1", access: "rw------", name: "WIDP admins" }];
    const excluded = ["dTenEaC7Qeu", "oMz2k4EvzR8"];

    return product.map((item: string[]) => ({
        baseElements: item[0],
        excludedDependencies: item[1] === "exclude" ? excluded : [],
        replaceExistingSharings: item[2],
        sharings: {
            userAccesses: item[3] === "user" ? user : [],
            userGroupAccesses: item[4] === "usergroup" ? userGroup : [],
            publicAccess: item[5] === "public" ? "rw------" : "--------",
        },
    }));
}

function processSharingSettings(sharingSettings: SharingSetting[]): Omit<SharingSetting, "name">[] {
    return _(sharingSettings)
        .map(({ id, access, displayName, name }) => ({
            id: id,
            access: access,
            displayName: displayName ?? name,
        }))
        .sortBy("id")
        .value();
}

class MockMetadataRepository implements MetadataRepository {
    getDependencies(_ids: string[]): FutureData<MetadataPayload> {
        const payloads = mergePayloads(_ids.map(id => metadata[id] ?? {}));
        return Future.success(payloads);
    }

    getMetadataWithChildren(ids: string[]): FutureData<MetadataPayload[]> {
        return Future.success(ids.map(id => metadata[id] ?? {}));
    }

    getMetadataFromIds(ids: string[]): FutureData<MetadataPayload> {
        return Future.success(mergePayloads(ids.map(id => metadata[id] ?? {})));
    }

    list(_options: ListOptions): FutureData<ListMetadataResponse> {
        throw new Error("Method not implemented.");
    }

    save(_payload: MetadataPayload): FutureData<ImportResult> {
        throw new Error("Method not implemented.");
    }

    getModelName(_model: string): string {
        throw new Error("Method not implemented.");
    }

    isShareable(_model: string): boolean {
        return true;
        //throw new Error("Method not implemented.");
    }

    isDataShareable(_model: string): boolean {
        return true;
        //throw new Error("Method not implemented.");
    }
}

export {};
