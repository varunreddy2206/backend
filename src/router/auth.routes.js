import express from "express";
import { signup, login, getProfile, updateProfile, uploadProfileImage, getRegistrations, getEnrolledStudents } from "../controllers/auth.controller.js";
import { loginValidation, signupValidation } from "../validations/auth.validation.js";
import { validate } from "../Middlewares/validate.js";
import { authenticateMiddle } from "../Middlewares/authmiddleware.js";
import { upload } from "../Middlewares/multer.config.js";

const router = express.Router();


router.post("/signup", signupValidation, validate, signup);
router.post("/login", loginValidation, validate, login);

// Profile routes (protected - require authentication)
router.get("/profile", authenticateMiddle, getProfile);
router.put("/profile", authenticateMiddle, updateProfile);
router.post("/upload-profile-image", authenticateMiddle, upload.single("profileImage"), uploadProfileImage);

// Registrations route
router.get("/registrations", authenticateMiddle, getRegistrations);

// Students route
router.get("/students", authenticateMiddle, getEnrolledStudents);

export default router;