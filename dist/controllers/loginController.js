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
exports.postLogin = postLogin;
exports.getSession = getSession;
const joi_1 = __importDefault(require("joi"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const db_1 = require("../src/db");
function postLogin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        const loginUserSchema = joi_1.default.object({
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().required(),
        });
        const validation = loginUserSchema.validate({ email, password }, { abortEarly: false });
        if (validation.error) {
            const message = validation.error.details.map((detail) => detail.message);
            return res.status(400).send(message);
        }
        try {
            const db = (0, db_1.getDb)();
            const user = yield db.collection("users").findOne({ email });
            if (!user) {
                return res.status(404).send("User not found");
            }
            const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).send("Invalid password");
            }
            const token = (0, uuid_1.v4)();
            yield db.collection("sessions").insertOne({
                userId: user._id,
                token,
                createdAt: Date.now(),
            });
            return res.status(200).send("Login successful");
        }
        catch (error) {
            console.error("Error during login:", error);
            return res.status(500).send("Server error");
        }
    });
}
function getSession(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { authorization } = req.headers;
        const token = authorization === null || authorization === void 0 ? void 0 : authorization.replace("Bearer ", "");
        if (!token) {
            return res.status(401).send("Token is missing");
        }
        try {
            const db = (0, db_1.getDb)();
            const session = yield db.collection("sessions").findOne({ token });
            if (!session) {
                return res.status(401).send("token not found");
            }
            const user = yield db.collection("users").findOne({ _id: session.userId });
            if (user) {
                delete user.password;
                res.send(user);
            }
            else {
                res.status(401).send("User not found");
            }
        }
        catch (error) {
            console.error("Error fetching session:", error);
            return res.status(500).send("Server error");
        }
    });
}
