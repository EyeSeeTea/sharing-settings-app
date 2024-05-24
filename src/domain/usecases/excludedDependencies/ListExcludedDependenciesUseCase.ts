import { UseCase } from "../../../CompositionRoot";
import { GlobalExcludedDependenciesRepository } from "../../repositories/GlobalExcludedDependenciesRepository";
import { FutureData } from "../../../domain/entities/Future";
import { Ref } from "../../entities/Ref";

export class ListExcludedDependenciesUseCase implements UseCase {
    constructor(private globalExcludedDependenciesRepository: GlobalExcludedDependenciesRepository) {}

    public execute(): FutureData<Ref[]> {
        return this.globalExcludedDependenciesRepository.list();
    }
}
