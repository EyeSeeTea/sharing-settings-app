import { SharedObject } from "./SharedObject";

export interface SharingUpdate {
    baseElements: string[];
    excludedDependencies: string[];
    sharings: SharedObject;
    replaceExistingSharings: boolean;
}
