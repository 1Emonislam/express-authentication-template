import dotenv from "dotenv";
dotenv.config();
import express, { Response, Request } from "express";
import http from 'http'
import { Server } from 'socket.io'
import morgan from 'morgan'
import mongoose from "mongoose";
import cors from 'cors'
const { errorLog, errorHandlerNotify } = require('express-error-handle')
import { config } from "./config/config";
import authRoutes from './api/routes/auth.routes'
//middlewares
const app = express();
const serverApp = http.createServer(app);
const io = new Server(serverApp, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
//middlewares
app.use(cors({
  origin: config.cors_support,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
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

//socket
io.on('connection', (socket: any) => {
  app.set('socket', socket)
  console.log('user connected ws', socket.id);
  socket.emit('status', 'Hello from websocket realtime connencted');
  socket.on('disconnect', () => {
    console.log('client disconnected');
  })
});
//all routes here
app.use(`/api/${config.api_version}/auth`, authRoutes)
app.get('/favicon.ico', (_req: Request, res: Response) => {
  res.status(204)
});

app.use([errorLog, errorHandlerNotify])