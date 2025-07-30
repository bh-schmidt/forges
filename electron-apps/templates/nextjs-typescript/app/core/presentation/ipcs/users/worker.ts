import "reflect-metadata";
//
import { GetUsers } from "@/application/use-cases/get-users/GetUsers";
import { UserDto } from "@domain/dtos/UserDto";
import { ResultObject } from "@shared/common/ResultObject";
import { container } from 'tsyringe';

export default function getUsers(): Promise<ResultObject<UserDto[]>> {
    const useCase = container.resolve(GetUsers)
    return useCase.run()
}