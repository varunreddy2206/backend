import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + ext);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB per file
  },
  fileFilter: function (req, file, cb) {
    // Allow PDFs for curriculumPdf
    if (file.fieldname === "curriculumPdf" && file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF allowed for curriculum"));
    }

    // Allow videos for lessonVideos
    if (file.fieldname === "lessonVideos" && !file.mimetype.startsWith("video/")) {
      return cb(new Error("Only video files allowed for lesson videos"));
    }

    // Allow PDFs for lessonMaterials
    if (file.fieldname === "lessonMaterials" && file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF allowed for lesson materials"));
    }

    // Allow images for thumbnail
    if (file.fieldname === "thumbnail" && !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed for thumbnail"));
    }

    // Allow images for profileImage
    if (file.fieldname === "profileImage" && !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed for profile image"));
    }

    cb(null, true);
  },
});
