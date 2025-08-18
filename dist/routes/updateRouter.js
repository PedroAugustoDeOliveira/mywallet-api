"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const updateTransactionsController_1 = require("./../controllers/updateTransactionsController");
const updateRouter = (0, express_1.Router)();
updateRouter.put("/transactions/:transactionId", updateTransactionsController_1.updateTransaction);
updateRouter.delete("/transactions/:transactionId", updateTransactionsController_1.deleteTransaction);
exports.default = updateRouter;
