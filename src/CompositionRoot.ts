import { Instance } from "./data/entities/Instance";
import { InstanceDefaultRepository } from "./data/repositories/InstanceDefaultRepository";
import { MetadataD2ApiRepository } from "./data/repositories/MetadataD2ApiRepository";
import { GlobalExcludedDependenciesD2ApiRepository } from "./data/repositories/GlobalExcludedDependenciesD2ApiRepository";
import { GetCurrentUserUseCase } from "./domain/usecases/instance/GetCurrentUserUseCase";
import { GetInstanceVersionUseCase } from "./domain/usecases/instance/GetInstanceVersionUseCase";
import { SearchUsersUseCase } from "./domain/usecases/instance/SearchUsersUseCase";
import { GetMetadataWithUpdatedSharingsUseCase } from "./domain/usecases/metadata/GetMetadataWithUpdatedSharingsUseCase";
import { GetModelNameUseCase } from "./domain/usecases/metadata/GetModelNameUseCase";
import { ImportMetadataUseCase } from "./domain/usecases/metadata/ImportMetadataUseCase";
import { ListDependenciesUseCase } from "./domain/usecases/metadata/ListDependenciesUseCase";
import { ListMetadataUseCase } from "./domain/usecases/metadata/ListMetadataUseCase";
import { SaveExcludedDependenciesUseCase } from "./domain/usecases/excludedDependencies/SaveExcludedDependenciesUseCase";
import { ListExcludedDependenciesUseCase } from "./domain/usecases/excludedDependencies/ListExcludedDependenciesUseCase";
import { GetSharingSummaryUseCase } from "./domain/usecases/metadata/GetSharingSummaryUseCase";

export function getCompositionRoot(instance: Instance) {
    const instanceRepository = new InstanceDefaultRepository(instance);
    const metadataRepository = new MetadataD2ApiRepository(instance);
    const globalExcludedDependenciesRepository = new GlobalExcludedDependenciesD2ApiRepository(instance);
    return {
        instance: getExecute({
            getCurrentUser: new GetCurrentUserUseCase(instanceRepository),
            getVersion: new GetInstanceVersionUseCase(instanceRepository),
            searchUsers: new SearchUsersUseCase(instanceRepository),
        }),
        metadata: getExecute({
            list: new ListMetadataUseCase(metadataRepository),
            getSharingSummary: new GetSharingSummaryUseCase(metadataRepository),
            listDependencies: new ListDependenciesUseCase(metadataRepository),
            getMetadataWithUpdatedSharings: new GetMetadataWithUpdatedSharingsUseCase(metadataRepository),
            getModelName: new GetModelNameUseCase(metadataRepository),
            import: new ImportMetadataUseCase(metadataRepository),
        }),
        excludedDependencies: getExecute({
            list: new ListExcludedDependenciesUseCase(globalExcludedDependenciesRepository),
            save: new SaveExcludedDependenciesUseCase(globalExcludedDependenciesRepository),
        }),
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

function getExecute<UseCases extends Record<Key, UseCase>, Key extends keyof UseCases>(
    useCases: UseCases
): { [K in Key]: UseCases[K]["execute"] } {
    const keys = Object.keys(useCases) as Key[];
    const initialOutput = {} as { [K in Key]: UseCases[K]["execute"] };

    return keys.reduce((output, key) => {
        const useCase = useCases[key];
        const execute = useCase.execute.bind(useCase) as UseCases[typeof key]["execute"];
        output[key] = execute;
        return output;
    }, initialOutput);
}

export interface UseCase {
    execute: Function;
}
