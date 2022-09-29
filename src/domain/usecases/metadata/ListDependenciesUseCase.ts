import _ from "lodash";
import { UseCase } from "../../../CompositionRoot";
import { FutureData } from "../../entities/Future";
import { MetadataPayload } from "../../entities/MetadataItem";
import { MetadataRepository } from "../../repositories/MetadataRepository";

export class ListDependenciesUseCase implements UseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    public execute(ids: string[]): FutureData<MetadataPayload> {
        return this.metadataRepository.getDependencies(ids).map(payload => this.cleanPayload(payload));
    }

    private cleanPayload(payload: MetadataPayload): MetadataPayload {
        return _.pickBy(payload, (_items, model) => this.metadataRepository.isShareable(model));
    }
}
