import { Router } from "express";
import { validateRegister } from "./../middlewares/validateRegister";
import { postRegister } from "../controllers/registerController";

const registerRouter = Router();

registerRouter.post("/register", validateRegister, postRegister);

export default registerRouter;
