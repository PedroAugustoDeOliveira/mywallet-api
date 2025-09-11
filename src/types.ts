import { ObjectId } from "mongodb";

export type TransactionType = "income" | "expense";

export interface Transaction {
  _id?: ObjectId;
  userId?: ObjectId;
  type: TransactionType;
  description: string;
  createdAt: Date;
  value: number;
}
