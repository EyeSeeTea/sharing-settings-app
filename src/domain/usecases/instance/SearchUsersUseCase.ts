import { UseCase } from "../../../CompositionRoot";
import { UserSearch } from "../../../data/entities/SearchUser";
import { FutureData } from "../../entities/Future";
import { InstanceRepository } from "../../repositories/InstanceRepository";

export class SearchUsersUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public execute(query: string): FutureData<UserSearch> {
        return this.instanceRepository.searchUsers(query);
    }
}
