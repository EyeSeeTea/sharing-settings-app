import { UseCase } from "../../../CompositionRoot";
import { FutureData } from "../../entities/Future";
import { ListMetadataResponse, ListOptions, MetadataRepository } from "../../repositories/MetadataRepository";

export class ListMetadataUseCase implements UseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    public execute(params: ListOptions): FutureData<ListMetadataResponse> {
        return this.metadataRepository.list(params);
    }
}
