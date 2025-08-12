import { Request, Response } from "express";
import { getDb } from "../src/db";
import Joi from "joi";
import { Transaction } from "../src/types";
import { ObjectId } from "mongodb";

export async function updateTransaction(req: Request, res: Response) {
  const { transactionId } = req.params;
  const { type, description, value } = req.body;

  const updateTransactionSchema = Joi.object({
    type: Joi.string().valid("income", "expense").required(),
    description: Joi.string().required(),
    value: Joi.number().positive().required(),
  });
  const validation = updateTransactionSchema.validate(
    { type, description, value },
    { abortEarly: false }
  );
  if (validation.error) {
    const message = validation.error.details.map((detail) => detail.message);
    return res
      .status(422)
      .send({ error: "Failed to validate update", details: message });
  }

  try {
    if (!ObjectId.isValid(transactionId)) {
      return res.status(400).send("Invalid transaction ID");
    }
    const db = getDb();

    const token = req.headers.authorization?.replace("Bearer ", "").trim();
    if (!token) {
      return res.status(401).send("Token is required");
    }
    const session = await db.collection("sessions").findOne({ token });
    if (!session) {
      return res.status(401).send("Invalid session");
    }

    const fielsToUpdate: Partial<Transaction> = {};
    if (type) fielsToUpdate.type = type;
    if (description) fielsToUpdate.description = description;
    if (value) fielsToUpdate.value = value;

    const updateResult = await db
      .collection<Transaction>("transactions")
      .updateOne(
        { _id: new ObjectId(transactionId), userId: session.userId },
        { $set: fielsToUpdate }
      );
    if (updateResult.modifiedCount === 0) {
      return res
        .status(404)
        .send("Transaction not found or not authorized to update");
    }
    res.status(200).send("Transaction updated successfully");
  } catch (error) {
    console.error("Error updating Transaction:", error);
    return res.status(500).send("Internal server error");
  }
}

export async function deleteTransaction(req: Request, res: Response) {
  const { transactionId } = req.params;

  try {
    if (!ObjectId.isValid(transactionId)) {
      return res.status(400).send("Invalid transaction ID");
    }

    const db = getDb();

    const token = req.headers.authorization?.replace("Bearer ", "").trim();
    if (!token) {
      return res.status(401).send("Token is required");
    }

    const session = await db.collection("sessions").findOne({ token });
    if (!session) {
      return res.status(401).send("Invaled session");
    }

    const deleteTransaction = await db
      .collection<Transaction>("transactions")
      .deleteOne({
        _id: new ObjectId(transactionId),
        userId: session.userId,
      });
    if (deleteTransaction.deletedCount === 0) {
      return res
        .status(404)
        .send("Transaction not found or not authorized to delete");
    }

    res.status(200).send("Transaction deleted successfully");
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return res.status(500).send("Internal server error");
  }
}
