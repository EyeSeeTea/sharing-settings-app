import { Future, FutureData } from "../../../domain/entities/Future";
import { Instance } from "../../entities/Instance";
import { D2Api, DataStore } from "../../../types/d2-api";
import { getD2APiFromInstance } from "../../../utils/d2-api";
import { apiToFuture } from "../../../utils/futures";
import { StorageClient } from "./StorageClient";

const dataStoreNamespace = "sharing-settings-app";

export class DataStoreStorageClient extends StorageClient {
    private api: D2Api;
    private dataStore: DataStore;

    constructor(instance: Instance) {
        super();
        this.api = getD2APiFromInstance(instance);
        this.dataStore = this.api.dataStore(dataStoreNamespace);
    }

    public getObject<T extends object>(key: string, defaultValue: T): FutureData<T> {
        return apiToFuture(this.dataStore.get<T>(key)).flatMap(value => {
            if (value !== undefined) return Future.success(value);
            return this.saveObject(key, defaultValue).map(() => defaultValue);
        });
    }

    public getObjectIfExists<T extends object>(key: string): FutureData<T | undefined> {
        return apiToFuture(this.dataStore.get<T>(key));
    }

    public listKeys(): FutureData<string[]> {
        return apiToFuture(this.dataStore.getKeys());
    }

    public saveObject<T extends object>(key: string, value: T): FutureData<void> {
        return apiToFuture(this.dataStore.save(key, value));
    }

    public removeObject(key: string): FutureData<boolean> {
        return apiToFuture(this.dataStore.delete(key));
    }
}
