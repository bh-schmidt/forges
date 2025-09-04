import { UserRepository } from "@infrastructure/repositories/user-repository/UserRepository"
import { GetUsers } from "./GetUsers"
import { instance, mock, verify } from "ts-mockito"

describe('get all users', () => {
    it('returns ok', () => {
        const repo = mock<UserRepository>()
        const useCase = new GetUsers(instance(repo))
        useCase.run()
        verify(repo.getAll()).once()
    })
})