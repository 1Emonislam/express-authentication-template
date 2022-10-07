import jwt from 'jsonwebtoken'
import { config } from '../config/config'
import User from '../model/user.model'

function genToken(info: object) {
    return jwt.sign(info, config.jwt_secret, {
        expiresIn: config.cookie_expires
    })
}
function genToken_short_time(id: string) {
    return jwt.sign({ id }, config.jwt_secret, {
        expiresIn: config.cookie_short_expires
    })
}
const verify_jwt = async (token: string) => {
    try {
        const decoded = jwt.verify(token, config.jwt_secret);
        //@ts-ignore
        const user = await User.findOne({ _id: decoded?.id })
        if (user?._id) {
            //@ts-ignore
            req.user = user;
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}
export { genToken, genToken_short_time, verify_jwt }