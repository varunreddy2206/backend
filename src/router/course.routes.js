import express from "express";
import {
  createCourse,
  deleteAllCourse,
  getCourseById,
  getCourses,
} from "../controllers/course.controller.js";
import { createCourseValidation } from "../validations/course.validation.js";
import { validate } from "../Middlewares/validate.js";
import { upload } from "../Middlewares/multer.config.js";

const router = express.Router();

// Create course with file uploads
router.post(
  "/create",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "curriculumPdf", maxCount: 1 },
    { name: "lessonVideos", maxCount: 200 },
    { name: "lessonMaterials", maxCount: 200 },
  ]),
  createCourseValidation,
  validate,
  createCourse
);

router.get("/all", getCourses); // Get all courses with filters
router.get("/category/:category", getCourses);
router.get("/:id", getCourseById);
router.delete("/delete", deleteAllCourse);

export default router;
