import { Document } from "mongoose"
export interface IUser extends Document {
    firstName: string,
    lastName?: string,
    phone?: string,
    birthDate?: string,
    nationality?: string,
    about?: string,
    gender?: string,
    address?: string,
    email: string,
    password: string,
    avatar?: String,
    roles: Array<string>,
    createdAt?: Date | string,
    updatedAt?: Date | string,
}