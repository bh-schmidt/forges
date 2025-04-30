import { UserDto } from "@domain/dtos/UserDto";
import { injectable } from "tsyringe";

@injectable()
export class UserRepository {
    getAll(): UserDto[] {
        return []
    }
}
