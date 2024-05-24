import { FutureData } from "../../domain/entities/Future";
import { Ref } from "../../domain/entities/Ref";

export interface GlobalExcludedDependenciesRepository {
    list(): FutureData<Ref[]>;
    save(excludedDependencies: string[]): FutureData<void>;
}
