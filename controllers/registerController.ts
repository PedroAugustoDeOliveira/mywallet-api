import { Request, Response } from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import { getDb } from "./../src/db";

export async function postRegister(req: Request, res: Response) {
  interface UserRegister {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }

  interface User {
    name: string;
    email: string;
    password: string;
  }

  const { name, email, password, confirmPassword } = req.body;

  const resgiterUserSchema = Joi.object<UserRegister>({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
      "any.only": "Passwords must match",
    }),
  });
  const validation = resgiterUserSchema.validate(
    { name, email, password, confirmPassword },
    { abortEarly: false }
  );
  if (validation.error) {
    const message = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(message);
  }

  try {
    const db = getDb();

    const hashedPassword = await bcrypt.hash(password, 10);

    const userToInsert: User = {
      name,
      email,
      password: hashedPassword,
    };

    const existUser = await db.collection<User>("users").findOne({ email });
    if (existUser) {
      return res.status(409).send("Email already registered");
    }

    const insertUser = await db
      .collection<User>("users")
      .insertOne(userToInsert);
    if (!insertUser) {
      return res.status(500).send("Error creating user");
    }

    res.status(201).send({ message: "User created" });
  } catch (err) {
    res.status(500).send(err);
  }
}
