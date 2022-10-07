import { NextFunction, Request, RequestHandler, Response } from "express"
import User from "../../model/user.model";
import _ from 'lodash'
import { genToken } from "../../utils/genJwtToken";
import { config } from "../../config/config";
import { generateUniqueAccountName, isValidEmail, isValidPassword } from "../../utils/func";
export const loginHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const email = req?.body?.email?.toLowerCase();
    const phone = req?.body?.phone;
    const username = req?.body?.username?.toLowerCase();
    const password = req?.body?.password;
    //console.log(req.body)
    if (!(email || phone || username)) {
        return res.status(400).json({ error: { "user": "Could not find user Please provide Email or Phone Number or UserName" } })
    }
    let user = await User.findOne({ username }) ? await User.findOne({ username }) : await User.findOne({ email })
    if (!user) {
        user = await User.findOne({ phone })
    }
    try {
        if (!user) {
            return res.status(400).json({ error: { "output": "Could not find user!" } })
        }
        //@ts-ignore
        if (!(user && (await user.matchPassword(password)))) {
            return res.status(400).json({ error: { "password": "Password invalid! please provide valid password!" } });
            //@ts-ignore
        } else if (user && (await user.matchPassword(password))) {
            const accessToken = genToken(_.omit(user, ["password"]))
            const expires = parseInt(config.cookie_expires || '30d') * 60 * 1000
            const options = {
                expires: new Date(new Date().getTime() + expires),
                httpOnly: true
            }
            return res.cookie('accessToken', accessToken, options).status(200).json({
                message: 'Login Successfully', accessToken
            })
        }
    }
    catch (error) {
        next(error)
    }
}
export const registerHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { email, firstName, username, lastName, phone, address, birthDate, nickName, avatar, about, gender, password, password2 } = req.body;
        username = username ? username?.toString() : (firstName + lastName)?.toString();
        const issue: any = {}
        const userExist = await User.findOne({ email });
        const phoneExist = await User.findOne({ phone });
        if (!(isValidPassword(password))) {
            issue.password = 'Password should contain min 8 letter password, with at least a symbol, upper and lower case'
        }
        if (password !== password2) {
            issue.password2 = 'Password Do Not Matched!'
        }
        if (userExist) {
            issue.email = 'user Already exists!'
        }
        if (!(isValidEmail(email))) {
            issue.email = 'Email Invalid! Please provide a valid Email!'
        }
        if (phoneExist) {
            issue.phone = 'This phone number is linked to another account, please enter another number.'
        }
        if (Object.keys(issue)?.length) {
            return res.status(400).json({ error: issue })
        }
        let userName = await generateUniqueAccountName({ proposedName: username });
        const usernameExist = await User.findOne({ username: userName });
        if (usernameExist) {
            userName = await generateUniqueAccountName({ proposedName: username })
        }
        if (!(userExist || phoneExist)) {
            const user = await User.create({
                username: userName,
                email, firstName, lastName, phone, birthDate, nickName, avatar, about, gender, password, address
            });
            if (!user) return res.status(500).json({ error: { 'output': 'Registration failed! internal server error!' } })
            const accessToken = genToken(_.omit(user, ["password"]))
            const expires = parseInt(config.cookie_expires || '30d') * 60 * 1000
            const options = {
                expires: new Date(new Date().getTime() + expires),
                httpOnly: true
            }
            return res.cookie('accessToken', accessToken, options).status(200).json({
                message: 'Login Successfully', accessToken
            })
        }
    } catch (error) {
        next(error);
    }
}