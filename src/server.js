import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import errorHandler from "./Middlewares/errorHandler.js";
import AuthRouter from "../src/router/auth.routes.js";
import CourseRouter from "../src/router/course.routes.js";
import logger from "./utils/logger.js";



const app = express();
const PORT = process.env.PORT || 8899;
const NODE_ENV = process.env.NODE_ENV;

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(PORT, () =>
      console.log(
        "Server is working on Port:" + PORT + " in " + NODE_ENV + " Mode."
      )
    );
  })
  .catch((e) => logger.error("Mongo connection error", e));

app.use("/auth", AuthRouter);
app.use("/course", CourseRouter);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Course Server..!" });
});

// Error handler should be last
app.use(errorHandler);
