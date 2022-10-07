import dotenv from "dotenv";
dotenv.config();
import express, { Response, Request } from "express";
import morgan from 'morgan'
import mongoose from "mongoose";
const { errorLog, errorHandlerNotify } = require('express-error-handle')
import { config } from "./config/config";
import authRouter from "./api/routes/auth.routes";
//middlewares
const app = express();
app.use(express.json());
app.use(morgan('dev'))
//database connected
mongoose
  .connect(config.db_uri)
  .then(() => {
    console.log(`💖 💖 💖 Database Successfully Connected 💖 💖 💖`);
    app.listen(config.port, () => {
      console.log(`Listening On PORT ${config.port}`);
    });
  })
  .catch((err: any) => {
    console.error(`⛔⛔⛔ Database connections Failed ⛔⛔⛔: ${JSON.stringify(err)}`);
  });
//database connected end

//all routes here
app.use(`${config.api_version}/auth`, authRouter)

app.get('/favicon.ico', (_req: Request, res: Response) => {
  res.status(204)
});
app.use([errorLog, errorHandlerNotify])