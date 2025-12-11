export interface UserI{
    id?: number;
    name: string;
    surname: string;
    email: string;
    username: string;
    password?: string;
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
}