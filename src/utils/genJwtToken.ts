import jwt from 'jsonwebtoken'
import { config } from '../config/config'

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

export { genToken, genToken_short_time }