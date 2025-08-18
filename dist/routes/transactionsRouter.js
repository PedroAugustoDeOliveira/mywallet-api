"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactionsController_1 = require("./../controllers/transactionsController");
const transactionsRouter = (0, express_1.Router)();
transactionsRouter.post("/income", transactionsController_1.postIncome);
transactionsRouter.post("/expense", transactionsController_1.postExpense);
transactionsRouter.get("/transactions", transactionsController_1.getTransactions);
exports.default = transactionsRouter;
