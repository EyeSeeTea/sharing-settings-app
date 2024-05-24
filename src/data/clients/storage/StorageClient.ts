import _ from "lodash";
import { Ref } from "../../../domain/entities/Ref";
import { FutureData } from "../../../domain/entities/Future";

export abstract class StorageClient {
    // Object operations
    public abstract getObject<T extends object>(key: string, defaultValue: T): FutureData<T>;
    public abstract getObjectIfExists<T extends object>(key: string): FutureData<T | undefined>;
    public abstract saveObject<T extends object>(key: string, value: T): FutureData<void>;
    public abstract removeObject(key: string): FutureData<boolean>;
    public abstract listKeys(): FutureData<string[]>;

    public listObjectsInCollection<T extends Ref>(key: string): FutureData<T[]> {
        return this.getObject<T[]>(key, []);
    }

    public getObjectInCollection<T extends Ref>(key: string, id: string): FutureData<T | undefined> {
        return this.getObject<T[]>(key, []).map(rawData => _.find(rawData, element => element.id === id));
    }

    public saveObjectsInCollection<T extends Ref>(key: string, elements: T[]): FutureData<void> {
        return this.getObject<Ref[]>(key, []).flatMap(oldData => {
            const cleanData = oldData.filter(item => !elements.some(element => item.id === element.id));
            return this.saveObject(key, [...cleanData, ...elements]);
        });
    }

    public saveObjectInCollection<T extends Ref>(key: string, element: T): FutureData<void> {
        return this.getObject(key, [] as Ref[]).flatMap(oldData => {
            const cleanData = oldData.filter(item => item.id !== element.id);
            const newData = [...cleanData, element];
            return this.saveObject(key, newData);
        });
    }

    public removeObjectInCollection(key: string, id: string): FutureData<void> {
        return this.getObject(key, [] as Ref[]).flatMap(oldData => {
            const newData = _.reject(oldData, { id });
            return this.saveObject(key, newData);
        });
    }
}
