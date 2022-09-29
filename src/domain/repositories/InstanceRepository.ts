import { UserSearch } from "../../data/entities/SearchUser";
import { FutureData } from "../entities/Future";
import { User } from "../entities/User";

export interface InstanceRepository {
    getBaseUrl(): string;
    getCurrentUser(): FutureData<User>;
    getInstanceVersion(): FutureData<string>;
    searchUsers(query: string): FutureData<UserSearch>;
}
