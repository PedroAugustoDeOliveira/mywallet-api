import { Router } from "express";
import {
  postIncome,
  postExpense,
  getTransactions,
} from "./../controllers/transactionsController";

const transactionsRouter = Router();

transactionsRouter.post("/income", postIncome);
transactionsRouter.post("/expense", postExpense);
transactionsRouter.get("/transactions", getTransactions);

export default transactionsRouter;
