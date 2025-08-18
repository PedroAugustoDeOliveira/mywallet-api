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
exports.updateTransaction = updateTransaction;
exports.deleteTransaction = deleteTransaction;
const db_1 = require("../src/db");
const joi_1 = __importDefault(require("joi"));
const mongodb_1 = require("mongodb");
function updateTransaction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { transactionId } = req.params;
        const { type, description, value } = req.body;
        const updateTransactionSchema = joi_1.default.object({
            type: joi_1.default.string().valid("income", "expense").required(),
            description: joi_1.default.string().required(),
            value: joi_1.default.number().positive().required(),
        });
        const validation = updateTransactionSchema.validate({ type, description, value }, { abortEarly: false });
        if (validation.error) {
            const message = validation.error.details.map((detail) => detail.message);
            return res
                .status(422)
                .send({ error: "Failed to validate update", details: message });
        }
        try {
            if (!mongodb_1.ObjectId.isValid(transactionId)) {
                return res.status(400).send("Invalid transaction ID");
            }
            const db = (0, db_1.getDb)();
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "").trim();
            if (!token) {
                return res.status(401).send("Token is required");
            }
            const session = yield db.collection("sessions").findOne({ token });
            if (!session) {
                return res.status(401).send("Invalid session");
            }
            const fielsToUpdate = {};
            if (type)
                fielsToUpdate.type = type;
            if (description)
                fielsToUpdate.description = description;
            if (value)
                fielsToUpdate.value = value;
            const updateResult = yield db
                .collection("transactions")
                .updateOne({ _id: new mongodb_1.ObjectId(transactionId), userId: session.userId }, { $set: fielsToUpdate });
            if (updateResult.modifiedCount === 0) {
                return res
                    .status(404)
                    .send("Transaction not found or not authorized to update");
            }
            res.status(200).send("Transaction updated successfully");
        }
        catch (error) {
            console.error("Error updating Transaction:", error);
            return res.status(500).send("Internal server error");
        }
    });
}
function deleteTransaction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { transactionId } = req.params;
        try {
            if (!mongodb_1.ObjectId.isValid(transactionId)) {
                return res.status(400).send("Invalid transaction ID");
            }
            const db = (0, db_1.getDb)();
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "").trim();
            if (!token) {
                return res.status(401).send("Token is required");
            }
            const session = yield db.collection("sessions").findOne({ token });
            if (!session) {
                return res.status(401).send("Invaled session");
            }
            const deleteTransaction = yield db
                .collection("transactions")
                .deleteOne({
                _id: new mongodb_1.ObjectId(transactionId),
                userId: session.userId,
            });
            if (deleteTransaction.deletedCount === 0) {
                return res
                    .status(404)
                    .send("Transaction not found or not authorized to delete");
            }
            res.status(200).send("Transaction deleted successfully");
        }
        catch (error) {
            console.error("Error deleting transaction:", error);
            return res.status(500).send("Internal server error");
        }
    });
}
