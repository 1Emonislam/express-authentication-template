import { Document, Types } from "mongoose"
export interface IUserSession extends Document {
    userId: Types.ObjectId,
    token: string,
    expiresIn: Date,
    updatedAt?: Date,
    createdAt?: Date,
}