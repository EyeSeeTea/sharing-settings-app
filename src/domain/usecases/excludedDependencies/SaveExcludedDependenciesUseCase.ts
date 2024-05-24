import { UseCase } from "../../../CompositionRoot";
import { GlobalExcludedDependenciesRepository } from "../../repositories/GlobalExcludedDependenciesRepository";
import { FutureData } from "../../../domain/entities/Future";

export class SaveExcludedDependenciesUseCase implements UseCase {
    constructor(private globalExcludedDependenciesRepository: GlobalExcludedDependenciesRepository) {}

    public execute(excludedDependencies: string[]): FutureData<void> {
        return this.globalExcludedDependenciesRepository.save(excludedDependencies);
    }
}
