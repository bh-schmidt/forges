import { UserRepository } from "@infrastructure/repositories/user-repository/UserRepository";
import { ResultObject } from "@shared/common/ResultObject";
import { injectable } from "tsyringe";

@injectable()
export class GetUsers {
    constructor(private userRepository: UserRepository) {
    }

    async run() {
        const users = await this.userRepository.getAll()

        const result = new ResultObject()
            .setValue(users)

        return result
    }
}