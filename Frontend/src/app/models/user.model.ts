export const Roles = {
    Admin: 'Administrator',
    Manager: 'Manager',
    Reader: 'Reader'
}

export interface UserModel {
    role: string;
    login: string;
    id: string;
}
