import { Router } from "express";
import {
  updateTransaction,
  deleteTransaction,
} from "./../controllers/updateTransactionsController";

const updateRouter = Router();

updateRouter.put("/transactions/:transactionId", updateTransaction);
updateRouter.delete("/transactions/:transactionId", deleteTransaction);

export default updateRouter;
