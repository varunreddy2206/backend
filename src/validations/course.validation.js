import { body } from "express-validator";

export const createCourseValidation = [
  body("title").notEmpty().withMessage("Course title is required"),

  body("subtitle").notEmpty().withMessage("Subtitle is required"),

  body("level")
    .notEmpty()
    .withMessage("Level is required")
    .isIn(["Beginner", "Intermediate", "Expert"])
    .withMessage("Level must be Beginner / Intermediate / Expert"),

  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 to 5"),

  body("totalReviews")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Reviews must be a valid number"),

  body("totalHours").notEmpty().withMessage("Total hours required"),

  body("studentsEnrolled")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Students enrolled must be a number"),

  // Instructor validation
  body("instructor.name").notEmpty().withMessage("Instructor name is required"),

  body("instructor.designation").optional(),

  // Curriculum validation
  body("curriculum")
    .isArray({ min: 1 })
    .withMessage("Curriculum must be an array"),

  body("curriculum.*.moduleTitle")
    .notEmpty()
    .withMessage("Module title is required"),

  body("curriculum.*.lessons")
    .isArray()
    .withMessage("Lessons must be an array"),

  body("curriculum.*.lessons.*.title")
    .notEmpty()
    .withMessage("Lesson title is required"),

  body("curriculum.*.lessons.*.duration")
    .notEmpty()
    .withMessage("Duration is required"),
];

export const addReviewValidation = [
  body("reviewerName").notEmpty().withMessage("Reviewer name is required"),

  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),

  body("comment").optional().isString().withMessage("Comment must be a string"),
];
