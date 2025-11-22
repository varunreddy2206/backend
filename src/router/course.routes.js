import express from "express";
import {
  createCourse,
  deleteAllCourse,
  getCourseById,
  getCourses,
} from "../controllers/course.controller.js";
import { createCourseValidation } from "../validations/course.validation.js";
import { validate } from "../Middlewares/validate.js";

const router = express.Router();

router.post("/create", createCourseValidation, validate, createCourse);
router.get("/category/:category", getCourses);
router.get("/:id", getCourseById);
router.delete("/delete", deleteAllCourse);
export default router;
