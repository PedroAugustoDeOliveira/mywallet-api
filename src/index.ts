import express, { Express, Request, Response } from "express";
import Joi, { valid } from "joi";
import dotenv from "dotenv";
import chalk from "chalk";
import bcrypt from "bcrypt";

import { connectToDatabase } from "./db";

import registerRouter from "./../routes/registerRouter";
import loginRouter from "../routes/loginRouter";
import transactionsRouter from "../routes/transactionsRouter";
import updateRouter from "./../routes/updateRouter";

dotenv.config();
const app: Express = express();
app.use(express.json());

app.use(registerRouter);
app.use(loginRouter);
app.use(transactionsRouter);
app.use(updateRouter);

const port = process.env.PORT || 5000;
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log("Server is running on port 5000");
  });
});
