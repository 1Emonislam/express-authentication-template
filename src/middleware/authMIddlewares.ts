import { RequestHandler, } from "express";
import jwt from 'jsonwebtoken'
import { config } from "../config/config";
import User from "../model/user.model";
const protect: RequestHandler = async (req, res, next) => {
    let token = req?.cookies?.accessToken;
    // console.log(token)
    //@ts-ignore
    if (req.headers.authorization && req.headers.authorization?.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({ error: { token: "no token!" } });
            }
            // console.log(token)
            const decoded = jwt.verify(token, config.jwt_secret);
            //@ts-ignore
            const user = await User.findOne({ _id: decoded?.id }).select("-password");
            if (!user) {
                return res.status(400).json({ error: { user: 'Please Login Before access this page!' } })
            } else {
                //@ts-ignore
                req.user = user;
                next();
            }

        } catch (error) {
            return res.status(401).json({ error: { token: `Not authorized token failed!` } });
        }
    } else if (token) {
        try {
            // console.log(token)
            const decoded = jwt.verify(token, config.jwt_secret);
            //@ts-ignore
            const user = await User.findOne({ _id: decoded?.id }).select("-password");
            if (!user) {
                return res.status(400).json({ error: { user: 'Please Login Before access this page!' } })
            } else {
                //@ts-ignore
                req.user = user;
                next();
            }
        } catch (error) {
            return res.status(401).json({ error: { token: `Not authorized token failed!` } });
        }
    } else {
        return res.status(401).json({ error: { token: "No token!" } });
    }
};
export default protect