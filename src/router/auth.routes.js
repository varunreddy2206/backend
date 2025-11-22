import express from "express";
import { signup, login } from "../controllers/auth.controller.js";
import { loginValidation, signupValidation } from "../validations/auth.validation.js";
import { validate } from "../Middlewares/validate.js";

const router = express.Router();


router.post("/signup", signupValidation, validate, signup);
router.post("/login", loginValidation, validate, login);
export default router;