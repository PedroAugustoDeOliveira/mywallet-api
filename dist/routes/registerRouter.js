"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateRegister_1 = require("./../middlewares/validateRegister");
const registerController_1 = require("../controllers/registerController");
const registerRouter = (0, express_1.Router)();
registerRouter.post("/register", validateRegister_1.validateRegister, registerController_1.postRegister);
exports.default = registerRouter;
