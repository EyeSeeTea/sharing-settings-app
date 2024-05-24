import { Instance } from "../entities/Instance";
import { GlobalExcludedDependenciesRepository } from "../../domain/repositories/GlobalExcludedDependenciesRepository";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { Namespaces } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { Ref } from "../../domain/entities/Ref";
import { FutureData } from "../../domain/entities/Future";

export class GlobalExcludedDependenciesD2ApiRepository implements GlobalExcludedDependenciesRepository {
    private storageClient: StorageClient;

    constructor(instance: Instance) {
        this.storageClient = new DataStoreStorageClient(instance);
    }

    public list(): FutureData<Ref[]> {
        const excludedDependencies = this.storageClient.listObjectsInCollection<Ref>(Namespaces.EXCLUDED_DEPENDENCIES);

        return excludedDependencies;
    }

    public save(excludedDependencies: string[]): FutureData<void> {
        const excludedIds = buildRefs(excludedDependencies);

        return this.storageClient.saveObject<Ref[]>(Namespaces.EXCLUDED_DEPENDENCIES, excludedIds);
    }
}

function buildRefs(dependencies: string[]): Ref[] {
    return dependencies.map(dependency => ({ id: dependency }));
}
