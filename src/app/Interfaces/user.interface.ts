export interface UserI{
    id?: number;
    name: string;
    surname: string;
    email: string;
    username: string;
    password?: string;
    role: string;
    phone: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}