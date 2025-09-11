import { Request, Response } from "express";
import Joi from "joi";
import { getDb } from "../src/db";

import { Transaction } from "./../src/types";
import { error } from "console";
import { ObjectId } from "mongodb";

export async function postIncome(req: Request, res: Response) {
  const { type, description, value } = req.body;
  const incomeSchema = Joi.object<Transaction>({
    type: Joi.string().valid("income").required(),
    description: Joi.string().required(),
    value: Joi.number().positive().required(),
  });

  const validation = incomeSchema.validate(
    { type, description, value },
    { abortEarly: false }
  );
  if (validation.error) {
    const message = validation.error.details.map((detail) => detail.message);
    return res
      .status(422)
      .send({ error: "Failed to validate income", details: message });
  }

  try {
    const db = getDb();

    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    const session = await db.collection("sessions").findOne({ token });
    if (!session) {
      return res.status(401).send("Invalid session");
    }

    const userId = session.userId;

    const incomeToInsert: Transaction = {
      description,
      value,
      type: "income",
      createdAt: new Date(),
      userId,
    };

    const insertIncome = await db
      .collection<Transaction>("transactions")
      .insertOne(incomeToInsert);
    if (!insertIncome) {
      return res.status(500).send("Error creating income transaction");
    }

    res.status(201).send("Income transaction created successfully");
  } catch (error) {
    console.error("Error inserting income transaction:", error);
    return res.status(500).send("Internal server error");
  }
}

export async function postExpense(req: Request, res: Response) {
  const { type, description, value } = req.body;

  const expenseSchema = Joi.object<Transaction>({
    type: Joi.string().valid("expense").required(),
    description: Joi.string().required(),
    value: Joi.number().positive().required(),
  });
  const validation = expenseSchema.validate(
    { type, description, value },
    { abortEarly: false }
  );
  if (validation.error) {
    const message = validation.error.details.map((detail) => detail.message);
    return res
      .status(422)
      .send({ error: "Failed to validate expense", details: message });
  }

  try {
    const db = getDb();

    const token = req.headers.authorization?.replace("Bearer", "").trim();
    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    const session = await db.collection("sessions").findOne({ token });
    if (!session) {
      return res.status(401).send("invalid session");
    }

    const userId = session.userId;

    const expenseToInsert: Transaction = {
      description,
      value,
      type: "expense",
      createdAt: new Date(),
      userId,
    };

    const insertExpense = await db
      .collection<Transaction>("transactions")
      .insertOne(expenseToInsert);
    if (!insertExpense) {
      return res.status(500).send("Error creating expense transaction");
    }

    res.status(201).send("Expense transaction created successfully");
  } catch (error) {
    console.error("Error inserting expense transaction:", error);
    return res.status(500).send("Internal server error");
  }
}

export async function getTransactions(req: Request, res: Response) {
  try {
    const db = getDb();

    const token = req.headers.authorization?.replace("Bearer", "").trim();
    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    const session = await db.collection("sessions").findOne({ token });
    if (!session) {
      return res.status(401).send("Invalid session");
    }

    const userId = session.userId;

    const transactions = await db
      .collection<Transaction>("transactions")
      .find({ userId })
      .toArray();
    if (!transactions || transactions.length === 0) {
      return res.status(404).send("No transactions found");
    }

    res.status(200).send(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).send("Failed to fetch transactions");
  }
}
