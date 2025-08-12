import { Request, Response } from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { getDb } from "../src/db";

export async function postLogin(req: Request, res: Response) {
  interface UserLogin {
    email: string;
    password: string;
  }

  const { email, password } = req.body;
  const loginUserSchema = Joi.object<UserLogin>({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  const validation = loginUserSchema.validate(
    { email, password },
    { abortEarly: false }
  );
  if (validation.error) {
    const message = validation.error.details.map((detail) => detail.message);
    return res.status(400).send(message);
  }

  try {
    const db = getDb();

    const user = await db.collection<UserLogin>("users").findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid password");
    }

    const token = uuid();

    await db.collection("sessions").insertOne({
      userId: user._id,
      token,
      createdAt: Date.now(),
    });

    return res.status(200).send("Login successful");
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).send("Server error");
  }
}

export async function getSession(req: Request, res: Response) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).send("Token is missing");
  }

  try {
    const db = getDb();

    const session = await db.collection("sessions").findOne({ token });
    if (!session) {
      return res.status(401).send("token not found");
    }

    const user = await db.collection("users").findOne({ _id: session.userId });

    if (user) {
      delete user.password;

      res.send(user);
    } else {
      res.status(401).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching session:", error);
    return res.status(500).send("Server error");
  }
}
