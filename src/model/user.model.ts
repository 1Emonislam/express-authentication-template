import { userEnumRoles } from "../helpers/enums/user.enum";
import { IUser } from "../helpers/interfaces/user.interface";
import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs'
const userSchema = new Schema<IUser>({
    firstName: { type: String, required: [true, 'First Name is required!'] },
    lastName: { type: String, default: 'N/A' },
    phone: { type: String, default: 'N/A' },
    email: { type: String, required: [true, 'Email is required!'] },
    birthDate: { type: String, default: 'N/A' },
    about: { type: String, default: 'N/A' },
    gender: { type: String, default: 'N/A' },
    address: { type: String, default: 'N/A' },
    password: { type: String, required: [true, 'Password invalid!'] },
    nationality: { type: String, default: 'N/A' },
    avatar: {
        type: String,
        default: 'https://gravatar.com/avatar/3385a4b3c13baa8a700cb41a27ef87c1'
    },
    roles: {
        type: [String],
        enum: Object.values(userEnumRoles),
        default: (Object.values(userEnumRoles) as Array<string>).filter((item) => item === 'student')
    },

}, { timestamps: true });

userSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
const User = model<IUser>('User', userSchema);
export default User;