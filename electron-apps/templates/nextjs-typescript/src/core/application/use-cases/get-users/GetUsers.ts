import { UserRepository } from "@infrastructure/repositories/user-repository/UserRepository";
import { injectable } from "tsyringe";

@injectable()
export class GetUsers {
    constructor(private userRepository: UserRepository) {
    }
    
    run() {
        console.log('getting users')
        return this.userRepository.getAll()
    }
}