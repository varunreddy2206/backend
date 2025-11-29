// import { body } from "express-validator";

// export const createCourseValidation = [
//   body("title").notEmpty().withMessage("Course title is required"),

//   body("subtitle").notEmpty().withMessage("Subtitle is required"),

//   body("level")
//     .notEmpty()
//     .withMessage("Level is required")
//     .isIn(["Beginner", "Intermediate", "Expert"])
//     .withMessage("Level must be Beginner / Intermediate / Expert"),

//   body("rating")
//     .optional()
//     .isFloat({ min: 0, max: 5 })
//     .withMessage("Rating must be between 0 to 5"),

//   body("totalReviews")
//     .optional()
//     .isInt({ min: 0 })
//     .withMessage("Reviews must be a valid number"),

//   body("totalHours").notEmpty().withMessage("Total hours required"),

//   body("studentsEnrolled")
//     .optional()
//     .isInt({ min: 0 })
//     .withMessage("Students enrolled must be a number"),

//   // Instructor validation
//   body("instructor.name").notEmpty().withMessage("Instructor name is required"),

//   body("instructor.designation").optional(),

//   // Curriculum validation
//   body("curriculum")
//     .isArray({ min: 1 })
//     .withMessage("Curriculum must be an array"),

//   body("curriculum.*.moduleTitle")
//     .notEmpty()
//     .withMessage("Module title is required"),

//   body("curriculum.*.lessons")
//     .isArray()
//     .withMessage("Lessons must be an array"),

//   body("curriculum.*.lessons.*.title")
//     .notEmpty()
//     .withMessage("Lesson title is required"),

//   body("curriculum.*.lessons.*.duration")
//     .notEmpty()
//     .withMessage("Duration is required"),
// ];

// export const addReviewValidation = [
//   body("reviewerName").notEmpty().withMessage("Reviewer name is required"),

//   body("rating")
//     .notEmpty()
//     .withMessage("Rating is required")
//     .isFloat({ min: 0, max: 5 })
//     .withMessage("Rating must be between 0 and 5"),

//   body("comment").optional().isString().withMessage("Comment must be a string"),
// ];

import { body } from "express-validator";
import { TrainingOptions } from "../common/courses.data.js";

// TRAINING OPTIONS BASED VALIDATION
// TRAINING OPTIONS BASED VALIDATION
export const createCourseValidation = [
  // Basic fields
  body("title").notEmpty().withMessage("Course title is required"),

  body("subtitle").notEmpty().withMessage("Subtitle is required"),

  body("level")
    .notEmpty()
    .withMessage("Level is required")
    .isIn(["Beginner", "Intermediate", "Expert"])
    .withMessage("Level must be Beginner / Intermediate / Expert"),

  body("totalHours").notEmpty().withMessage("Total hours required"),

  body("language").notEmpty().withMessage("Language is required"),

  body("basePrice")
    .notEmpty()
    .withMessage("Base price is required")
    .isNumeric()
    .withMessage("Base price must be a number"),

  // Instructor Validation
  body("instructorName").notEmpty().withMessage("Instructor name is required"),

  // Training Option
  body("trainingOptions")
    .notEmpty()
    .withMessage("Training option required")
    .isIn(Object.values(TrainingOptions))
    .withMessage("Invalid training option"),

  // -------------------------
  // SELF LEARNING VALIDATION
  // -------------------------
  body("curriculum")
    .if(body("trainingOptions").equals("Self Learning"))
    .notEmpty()
    .withMessage("Curriculum is required for self learning")
    .custom((value) => {
      try {
        const curriculum = JSON.parse(value);
        if (!Array.isArray(curriculum) || curriculum.length === 0) {
          throw new Error("Curriculum must be a non-empty array");
        }
        curriculum.forEach((module, mIndex) => {
          if (!module.moduleTitle)
            throw new Error(`Module ${mIndex + 1} title is required`);
          if (!Array.isArray(module.lessons) || module.lessons.length === 0)
            throw new Error(`Module ${mIndex + 1} must have lessons`);

          module.lessons.forEach((lesson, lIndex) => {
            if (!lesson.title)
              throw new Error(
                `Lesson ${lIndex + 1} in Module ${mIndex + 1} title is required`
              );
            if (!lesson.duration)
              throw new Error(
                `Lesson ${lIndex + 1} in Module ${mIndex + 1
                } duration is required`
              );
            if (
              lesson.type &&
              !["video", "quiz", "material"].includes(lesson.type)
            )
              throw new Error(
                `Lesson ${lIndex + 1} in Module ${mIndex + 1} has invalid type`
              );
          });
        });
        return true;
      } catch (error) {
        throw new Error("Invalid curriculum format: " + error.message);
      }
    }),

  // -------------------------
  // BATCH BASED COURSES
  // (Live, Classroom, Corporate)
  // -------------------------
  body("batches")
    .if(
      body("trainingOptions").isIn([
        "Live Classes",
        "Classroom Classes",
        "Corporate",
      ])
    )
    .notEmpty()
    .withMessage("Batches are required for this course type")
    .custom((value) => {
      try {
        // If batches is sent as string (JSON), parse it. If sent as array (from some clients), use as is.
        // Assuming JSON string for consistency if FormData
        const batches = typeof value === "string" ? JSON.parse(value) : value;
        if (!Array.isArray(batches) || batches.length === 0) {
          throw new Error("Batches must be a non-empty array");
        }
        return true;
      } catch (e) {
        throw new Error("Invalid batches format");
      }
    }),
];

// -------------------------------
// ADD REVIEW VALIDATION
// -------------------------------
export const addReviewValidation = [
  body("reviewerName").notEmpty().withMessage("Reviewer name is required"),

  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),

  body("comment").optional().isString().withMessage("Comment must be a string"),
];
