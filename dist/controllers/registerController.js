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
exports.postRegister = postRegister;
const joi_1 = __importDefault(require("joi"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./../src/db");
function postRegister(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, email, password, confirmPassword } = req.body;
        const resgiterUserSchema = joi_1.default.object({
            name: joi_1.default.string().required(),
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().required(),
            confirmPassword: joi_1.default.any().valid(joi_1.default.ref("password")).required().messages({
                "any.only": "Passwords must match",
            }),
        });
        const validation = resgiterUserSchema.validate({ name, email, password, confirmPassword }, { abortEarly: false });
        if (validation.error) {
            const message = validation.error.details.map((detail) => detail.message);
            return res.status(422).send(message);
        }
        try {
            const db = (0, db_1.getDb)();
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const userToInsert = {
                name,
                email,
                password: hashedPassword,
            };
            const existUser = yield db.collection("users").findOne({ email });
            if (existUser) {
                return res.status(409).send("Email already registered");
            }
            const insertUser = yield db
                .collection("users")
                .insertOne(userToInsert);
            if (!insertUser) {
                return res.status(500).send("Error creating user");
            }
            res.status(201).send({ message: "User created" });
        }
        catch (err) {
            res.status(500).send(err);
        }
    });
}
