import { Router } from "express";
import { validateRegister } from "./../middlewares/validateRegister";
import { postRegister, getUsers } from "../controllers/registerController";

const registerRouter = Router();

registerRouter.post("/register", validateRegister, postRegister);
registerRouter.get("/users/me", getUsers);

export default registerRouter;
