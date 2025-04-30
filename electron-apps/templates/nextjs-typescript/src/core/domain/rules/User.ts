import { UserDto } from "@domain/dtos/UserDto";

export namespace User {
    export function isValid(_: UserDto) {
        return true
    }
}