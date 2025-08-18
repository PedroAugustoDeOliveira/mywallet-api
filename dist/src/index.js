"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const registerRouter_1 = __importDefault(require("./../routes/registerRouter"));
const loginRouter_1 = __importDefault(require("../routes/loginRouter"));
const transactionsRouter_1 = __importDefault(require("../routes/transactionsRouter"));
const updateRouter_1 = __importDefault(require("./../routes/updateRouter"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(registerRouter_1.default);
app.use(loginRouter_1.default);
app.use(transactionsRouter_1.default);
app.use(updateRouter_1.default);
const port = process.env.PORT || 5000;
(0, db_1.connectToDatabase)().then(() => {
    app.listen(port, () => {
        console.log("Server is running on port 5000");
    });
});
