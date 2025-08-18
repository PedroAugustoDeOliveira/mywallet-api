"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postIncome = postIncome;
exports.postExpense = postExpense;
exports.getTransactions = getTransactions;
const joi_1 = __importDefault(require("joi"));
const db_1 = require("../src/db");
function postIncome(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { type, description, value } = req.body;
        const incomeSchema = joi_1.default.object({
            type: joi_1.default.string().valid("income").required(),
            description: joi_1.default.string().required(),
            value: joi_1.default.number().positive().required(),
        });
        const validation = incomeSchema.validate({ type, description, value }, { abortEarly: false });
        if (validation.error) {
            const message = validation.error.details.map((detail) => detail.message);
            return res
                .status(422)
                .send({ error: "Failed to validate income", details: message });
        }
        try {
            const db = (0, db_1.getDb)();
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
            if (!token) {
                return res.status(401).send("Unauthorized");
            }
            const session = yield db.collection("sessions").findOne({ token });
            if (!session) {
                return res.status(401).send("Invalid session");
            }
            const userId = session.userId;
            const incomeToInsert = {
                description,
                value,
                type: "income",
                userId,
            };
            const insertIncome = yield db
                .collection("transactions")
                .insertOne(incomeToInsert);
            if (!insertIncome) {
                return res.status(500).send("Error creating income transaction");
            }
            res.status(201).send("Income transaction created successfully");
        }
        catch (error) {
            console.error("Error inserting income transaction:", error);
            return res.status(500).send("Internal server error");
        }
    });
}
function postExpense(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { type, description, value } = req.body;
        const expenseSchema = joi_1.default.object({
            type: joi_1.default.string().valid("expense").required(),
            description: joi_1.default.string().required(),
            value: joi_1.default.number().positive().required(),
        });
        const validation = expenseSchema.validate({ type, description, value }, { abortEarly: false });
        if (validation.error) {
            const message = validation.error.details.map((detail) => detail.message);
            return res
                .status(422)
                .send({ error: "Failed to validate expense", details: message });
        }
        try {
            const db = (0, db_1.getDb)();
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer", "").trim();
            if (!token) {
                return res.status(401).send("Unauthorized");
            }
            const session = yield db.collection("sessions").findOne({ token });
            if (!session) {
                return res.status(401).send("invalid session");
            }
            const userId = session.userId;
            const expenseToInsert = {
                description,
                value,
                type: "expense",
                userId,
            };
            const insertExpense = yield db
                .collection("transactions")
                .insertOne(expenseToInsert);
            if (!insertExpense) {
                return res.status(500).send("Error creating expense transaction");
            }
            res.status(201).send("Expense transaction created successfully");
        }
        catch (error) {
            console.error("Error inserting expense transaction:", error);
            return res.status(500).send("Internal server error");
        }
    });
}
function getTransactions(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const db = (0, db_1.getDb)();
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer", "").trim();
            if (!token) {
                return res.status(401).send("Unauthorized");
            }
            const session = yield db.collection("sessions").findOne({ token });
            if (!session) {
                return res.status(401).send("Invalid session");
            }
            const userId = session.userId;
            const transactions = yield db
                .collection("transactions")
                .find({ userId })
                .toArray();
            if (!transactions || transactions.length === 0) {
                return res.status(404).send("No transactions found");
            }
            res.status(200).send(transactions);
        }
        catch (error) {
            console.error("Error fetching transactions:", error);
            return res.status(500).send("Failed to fetch transactions");
        }
    });
}
