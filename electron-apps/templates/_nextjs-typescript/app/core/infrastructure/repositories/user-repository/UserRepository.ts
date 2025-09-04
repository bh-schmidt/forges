import { UserDto } from "@domain/dtos/UserDto";
import { injectable } from "tsyringe";

@injectable()
export class UserRepository {
    getAll(): Promise<UserDto[]> {
        const result = [{
            id: 1,
            name: 'User 1'
        }]

        return Promise.resolve(result)
    }
}
