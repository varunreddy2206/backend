import mongoose from "mongoose";
import {
  COURSE_CATEGORY,
  COURSE_LEVEL,
  TrainingOptions,
} from "../common/courses.data.js";

// ------------------- Instructor -------------------
// const InstructorSchema = new mongoose.Schema({
//   name: { type: String },
//   profileImage: { type: String },
//   designation: { type: String },
//   experience: { type: String },
//   bio: { type: String },
// });

// ------------------- Rating -------------------
const RatingSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
});

// ------------------- Self Learning Curriculum -------------------
const QuizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: String, required: true },
});

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: String },
  type: {
    type: String,
    enum: ["video", "quiz", "material"],
    default: "video",
  },
  uploadVideo: { type: String }, // For type 'video'
  materialUrl: { type: String }, // For type 'material' (PDF)
  quiz: [QuizSchema], // For type 'quiz'
});

const ModuleSchema = new mongoose.Schema({
  moduleTitle: { type: String, required: true },
  lessons: [LessonSchema],
});

// ------------------- Batches for Live/Classroom/Corporate -------------------
const BatchSchema = new mongoose.Schema({
  batchTitle: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timings: { type: String, required: true },
  seats: { type: Number, required: true },
});

// ------------------- Course Schema -------------------
const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },

    category: {
      type: String,
      enum: Object.values(COURSE_CATEGORY),
      required: true,
    },

    level: {
      type: String,
      enum: Object.values(COURSE_LEVEL),
      required: true,
    },

    description: { type: String },
    skills: [{ type: String }],
    careerOpportunities: [{ type: String }],
    instructorName: { type: String }, 

    thumbnail: { type: String },
    curriculumPdf: { type: String },

    totalHours: { type: String, required: true },
    lessonsCount: { type: String },
    studentLimit: { type: Number },
    language: { type: String, required: true },
    certificate: { type: Boolean, default: false },

    // ------------------- NEW TRAINING OPTIONS (MAIN LOGIC) -------------------
    trainingOptions: {
      type: String,
      enum: Object.values(TrainingOptions),
      required: true,
    },

    // Self Learning ONLY → curriculum
    curriculum: [ModuleSchema],

    // Live / Classroom / Corporate ONLY → batches
    batches: [BatchSchema],

    // ------------------- Pricing -------------------
    basePrice: { type: Number, required: true },
    discount: { type: Number },

    // ------------------- Reviews -------------------
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reviews: [RatingSchema],

    // ------------------- Enrollment -------------------
    enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const CourseModel = mongoose.model("Course", CourseSchema);
export default CourseModel;
