import { NextFunction, Request, RequestHandler, Response } from "express"
import User from "../../model/user.model";
import _ from 'lodash'
import { genToken, genToken_short_time, verify_jwt } from "../../utils/genJwtToken";
import { config } from "../../config/config";
import moment from 'moment'
import { isValidEmail, isValidPassword, mailSending } from "../../utils/func";
export const loginHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const email = req?.body?.email?.toLowerCase();
    const password = req?.body?.password;
    const phone = req?.body?.phone;
    //console.log(req.body)
    if (!(email || phone)) {
        return res.status(400).json({ error: { "user": "Could not find user!" } })
    }
    let user = await User.findOne({ email }) || await User.findOne({ phone });
    try {
        if (!user) {
            return res.status(400).json({ error: { "output": "Could not find user!" } })
        }
        //@ts-ignore
        if (!(user && (await user.matchPassword(password)))) {
            return res.status(400).json({ error: { "password": "Password invalid! please provide valid password!" }, isError: true, isSuccess: false });
            //@ts-ignore
        } else if (user && (await user.matchPassword(password))) {
            const accessToken = genToken(_.omit(user?.toObject(), ["password"]))
            const expires = (parseInt(config.cookie_expires || '30d') * 24 * 60 * 60 * 1000)
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
        let { email, firstName, nationality, roles, lastName, phone, address, birthDate, avatar, about, gender, password, password2 } = req.body;

        const issue: any = {}
        const userExist = await User.findOne({ email }) || await User.findOne({ phone });
        if (!(isValidPassword(password))) {
            issue.password = 'Password should contain min 8 letter password, with at least a symbol, upper and lower case'
        }
        if (userExist) {
            issue.email = 'Already exists!'
        }
        if (password !== password2) {
            issue.password2 = 'Password Do Not Matched!'
        }
        if (!(isValidEmail(email))) {
            issue.email = 'Email Invalid! Please provide a valid Email!'
        }
        if (Object.keys(issue)?.length) {
            return res.status(400).json({ error: issue, isError: true, isSuccess: false })
        }
        const user = await User.create({
            email, nationality, firstName, lastName, phone, birthDate, roles, avatar, about, gender, password, address
        });
        if (!user) return res.status(500).json({ error: { 'output': 'Registration failed! internal server error!' } })
        const accessToken = genToken(_.omit(user?.toObject(), ["password"]))
        const expires = (parseInt(config.cookie_expires || '30d') * 24 * 60 * 60 * 1000)
        const options = {
            expires: new Date(new Date().getTime() + expires),
            httpOnly: true
        }
        return res.cookie('accessToken', accessToken, options).status(200).json({
            message: 'Registration Successfully', accessToken
        })
    } catch (error) {
        next(error);
    }
}

export const changePasswordHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { oldPassword, password, password2 } = req.body;
        //@ts-ignore
        const user = await User.findOne({ _id: req?.user?._id });
        const issue = {}
        if (password !== password2) {
            //@ts-ignore
            issue.password2 = 'New Password and Confirm Password are not the same!'
        }

        if (!(isValidPassword(password))) {
            //@ts-ignore
            issue.password = "Password should contain min 8 letter password, with at least a symbol, upper and lower case";
        }
        //@ts-ignore
        if (!(oldPassword && (await user?.matchPassword(oldPassword)))) {
            //@ts-ignore
            issue.password = 'old password does not match!'
        }
        if (Object.keys(issue)?.length) {
            return res.status(400).json({ error: issue, isError: true, isSuccess: false })
        }
        //@ts-ignore
        if (oldPassword && (await user.matchPassword(oldPassword))) {
            //@ts-ignore
            user.password = password;
            //@ts-ignoreI
            const updatedPassword = await user.save();
            if (!updatedPassword) {
                return res.status(400).json({ error: { password: 'Password change failed, please try again!' } })
            } else {
                const resData = await User.findOne({ _id: user?._id }).select("-password")
                const mailInfo = {
                    subject: `Check your account privacy. You have recently changed your password`,
                    msg: `Check your account privacy. You have recently changed your password`,
                    user: resData,
                    date: moment().format(),
                    link: config.client_url
                }
                const htmlMSG = `<!DOCTYPE html>
  <html lang="en-US">
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>${mailInfo?.subject}</title>
    <meta name="description" content="${mailInfo?.subject}" />
  </head>
  <body
    marginheight="0"
    topmargin="0"
    marginwidth="0"
    style="margin: 0px; background-color: #f2f3f8"
    leftmargin="0"
  >
    <table
      cellspacing="0"
      border="0"
      cellpadding="0"
      width="100%"
      bgcolor="#f2f3f8"
      style="
        @import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700);
        font-family: 'Open Sans', sans-serif;
      "
    >
      <tr>
        <td>
          <table
            style="background-color: #f2f3f8; max-width: 670px; margin: 0 auto"
            width="100%"
            border="0"
            align="center"
            cellpadding="0"
            cellspacing="0"
          >
            <tr>
              <td style="height: 80px">&nbsp;</td>
            </tr>
            <tr>
              <td style="text-align: center">
                <a
                  href="${config.client_url}"
                  title="logo"
                  target="_blank"
                >
                  <img
                    src="${config.logo}"
                    width="60px"
                    height="60px"
                    title="logo"
                    alt="logo"
                  />
                </a>
              </td>
            </tr>
            <tr>
              <td style="height: 20px">&nbsp;</td>
            </tr>
            <tr>
              <td>
                <table
                  width="95%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    max-width: 670px;
                    background: #fff;
                    border-radius: 3px;
                    text-align: center;
                    -webkit-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                    -moz-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                    box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                  "
                >
                  <tr>
                    <td style="height: 40px">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding: 0 35px">
                    <h3>Hello Dear, ${mailInfo?.user?.firstName}</h3>
                    Date ${mailInfo?.date}
                    <br/>
                      <p
                        style="
                          color: #455056;
                          font-size: 15px;
                          line-height: 24px;
                          margin: 0;
                        "
                      >
                      ${mailInfo.msg}
                      </p>
                      <h4
                        style="
                          color: #1e1e2d;
                          font-weight: 500;
                          margin: 0;
                          font-size: 32px;
                          font-family: 'Rubik', sans-serif;
                        "
                      >
                        ${mailInfo?.subject}
                      </h4>
                      <a
                        href="${mailInfo?.link}"
                        style="
                          background: #20e277;
                          text-decoration: none !important;
                          font-weight: 500;
                          margin-top: 35px;
                          color: #fff;
                          text-transform: uppercase;
                          font-size: 14px;
                          padding: 10px 24px;
                          display: inline-block;
                          border-radius: 50px;
                        "
                        >Back Ilearn</a
                      >
                    </td>
                  </tr>
                  <tr>
                    <td style="height: 40px">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height: 20px">&nbsp;</td>
            </tr>
            <tr>
              <td style="text-align: center">
                <p
                  style="
                    font-size: 14px;
                    color: rgba(69, 80, 86, 0.7411764705882353);
                    line-height: 18px;
                    margin: 0 0 0;
                  "
                >
                  &copy; <strong>${config?.domain}</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="height: 80px">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

                const sending = await mailSending(user?.email, mailInfo, htmlMSG);
                //@ts-ignore
                const accessToken = genToken(resData)
                const expires = (parseInt(config.cookie_expires || '30d') * 24 * 60 * 60 * 1000)
                const options = {
                    expires: new Date(new Date().getTime() + expires),
                    httpOnly: true
                }

                return res.cookie('accessToken', accessToken, options).status(200).json({
                    message: "Password has been successfully changed", accessToken
                })

            }
        }
    } catch (error) {
        next(error)
    }
}

export const forgetPasswordHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { email, phone } = req.body;
    const issue: any = {};
    if (!(email || phone)) {
        issue.email = "invalid Request Provide Email or Phone"
    }
    try {
        const user = await User.findOne({ email }).select("-password") || await User.findOne({ phone }).select("-password");
        if (!user) {
            issue.email = 'Could not find user!'
        }
        if (Object.keys(issue)?.length) {
            return res.status(400).json({ error: issue, isError: true, isSuccess: false })
        }
        const mailInfo = {
            subject: `You have
      requested to reset your password ${config.domain} account`,
            msg: `We cannot simply send you your old password. A unique link to reset your
      password has been generated for you. To reset your password, click the
      following link and follow the instructions.`,
            user: user,
            date: moment().format(),
            link: `${config.client_url}/api/v1/auth/reset-password/${genToken_short_time(user?._id)}`
        }
        const htmlMSG = `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
  <title>${mailInfo?.subject}</title>
  <meta name="description" content="${mailInfo?.subject}" />
</head>
<body
  marginheight="0"
  topmargin="0"
  marginwidth="0"
  style="margin: 0px; background-color: #f2f3f8"
  leftmargin="0"
>
  <table
    cellspacing="0"
    border="0"
    cellpadding="0"
    width="100%"
    bgcolor="#f2f3f8"
    style="
      @import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700);
      font-family: 'Open Sans', sans-serif;
    "
  >
    <tr>
      <td>
        <table
          style="background-color: #f2f3f8; max-width: 670px; margin: 0 auto"
          width="100%"
          border="0"
          align="center"
          cellpadding="0"
          cellspacing="0"
        >
          <tr>
            <td style="height: 80px">&nbsp;</td>
          </tr>
          <tr>
            <td style="text-align: center">
              <a
                href="${config.client_url}"
                title="logo"
                target="_blank"
              >
                <img
                  src="${config.logo}"
                  width="60px"
                  height="60px"
                  title="logo"
                  alt="logo"
                />
              </a>
            </td>
          </tr>
          <tr>
            <td style="height: 20px">&nbsp;</td>
          </tr>
          <tr>
            <td>
              <table
                width="95%"
                border="0"
                align="center"
                cellpadding="0"
                cellspacing="0"
                style="
                  max-width: 670px;
                  background: #fff;
                  border-radius: 3px;
                  text-align: center;
                  -webkit-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                  -moz-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                  box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                "
              >
                <tr>
                  <td style="height: 40px">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding: 0 35px">
                  <h3>Hello Dear,${mailInfo?.user?.firstName}</h3>
                  Date ${mailInfo?.date}
                  <br/>
                    <p
                      style="
                        color: #455056;
                        font-size: 15px;
                        line-height: 24px;
                        margin: 0;
                      "
                    >
                    ${mailInfo.msg}
                    </p>
                    <h4
                      style="
                        color: #1e1e2d;
                        font-weight: 500;
                        margin: 0;
                        font-size: 32px;
                        font-family: 'Rubik', sans-serif;
                      "
                    >
                      ${mailInfo?.subject}
                    </h4>
                    <a
                      href="${mailInfo?.link}"
                      style="
                        background: #20e277;
                        text-decoration: none !important;
                        font-weight: 500;
                        margin-top: 35px;
                        color: #fff;
                        text-transform: uppercase;
                        font-size: 14px;
                        padding: 10px 24px;
                        display: inline-block;
                        border-radius: 50px;
                      "
                      >Reset
                      Password</a
                    >
                  </td>
                </tr>
                <tr>
                  <td style="height: 40px">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="height: 20px">&nbsp;</td>
          </tr>
          <tr>
            <td style="text-align: center">
              <p
                style="
                  font-size: 14px;
                  color: rgba(69, 80, 86, 0.7411764705882353);
                  line-height: 18px;
                  margin: 0 0 0;
                "
              >
                &copy; <strong>${config.domain}</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="height: 80px">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
        const sending = await mailSending(user?.email, mailInfo, htmlMSG);
        // console.log(sending)
        if (sending === true) {
            return res.status(200).json({ message: 'Password reset email successfully send! Please check your email inbox or spam folder', isError: true, isSuccess: false })
        }
        if (sending === false) {
            return res.status(200).json({ error: { email: "Password reset email sending failed! please try again!" }, isError: true, isSuccess: false })
        }

    }
    catch (error) {
        next(error)
    }
}

export const resetPasswordHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password, password2 } = req.body;
        //@ts-ignore
        const user = await verify_jwt(req?.params?.token);
        // console.log(user)
        const issue: any = {};
        if (!user) {
            issue.email = 'credentials invalid! session expired!'
        }
        if (!password) {
            issue.password = 'Invalid Password Please provide valid password'
        }
        if ((password !== password2)) {
            issue.password2 = 'Password does not match New Password And Confirm Password'
        }
        if (!(isValidPassword(password))) {
            issue.password = "Password should contain min 8 letter password, with at least a symbol, upper and lower case"
        }
        if (Object.keys(issue)?.length) {
            return res.status(400).json({ error: issue, isError: true, isSuccess: true })
        }
        if (user) {
            //@ts-ignore
            const resetUser = await User.findOne({ _id: req?.user?._id })
            //@ts-ignore
            resetUser.password = password;
            //@ts-ignore
            resetUser.save().then(result => {
                const accessToken = genToken(_.omit(result.toObject(), ["password"]))
                const expires = (parseInt(config.cookie_expires || '30d') * 24 * 60 * 60 * 1000)
                const options = {
                    expires: new Date(new Date().getTime() + expires),
                    httpOnly: true
                }
                return res.cookie('accessToken', accessToken, options).status(200).json({
                    message: "Password Reset Successfully!", accessToken
                })
            }).catch(err => {
                return res.status(400).json({ error: { password: "Password Reset failed! please try again!" }, isError: true, isSuccess: false });
            })
        }
    } catch (error) {
        next(error)
    }
}
