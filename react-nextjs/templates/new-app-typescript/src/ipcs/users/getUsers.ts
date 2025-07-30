import { ipc } from "../ipc";

export function getUsers() {
    return ipc.send<any[]>('users.get-users')
}