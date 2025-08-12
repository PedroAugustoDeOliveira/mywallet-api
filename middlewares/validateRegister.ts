import { Request, Response, NextFunction } from "express";

export function validateRegister(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, email, password } = req.body;

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  if (!name || !email || !password) {
    return res.status(400).send("All fields are required");
  }

  if (!regexEmail.test(email)) {
    return res.status(400).send("Invalid email format");
  }

  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .send(
        "Password must be at least 8 characters long and contain at least one number and one special character"
      );
  }

  next();
}
