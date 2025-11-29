import CourseModel from "../modals/course.model.js";
import logger from "../utils/logger.js";

// export const createCourse = async (req, res) => {
//   try {
//     const newCourse = await CourseModel.create(req.body);

//     return res.status(201).json({
//       status: true,
//       message: "Course created successfully",
//       data: newCourse,
//     });
//   } catch (error) {
//     console.log("Create Course Error:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Server Error",
//     });
//   }
// };

export const createCourse = async (req, res) => {
  try {
    const body = req.body;
    if (req.files["thumbnail"]) {
      body.thumbnail = req.files["thumbnail"][0].path;
    }

    // Attach thumbnail image if uploaded
    if (req.files["thumbnail"]) {
      body.thumbnail = req.files["thumbnail"][0].path;
    }

    // Attach PDF file if uploaded
    if (req.files["curriculumPdf"]) {
      body.curriculumPdf = req.files["curriculumPdf"][0].path;
    }

    // Attach lesson videos & materials (Self Learning)
    if (body.trainingOptions === "Self Learning") {
      let videoFiles = req.files["lessonVideos"] || [];
      let materialFiles = req.files["lessonMaterials"] || [];

      let videoIndex = 0;
      let materialIndex = 0;

      // Parse curriculum if it's a string (it should be, based on validation)
      if (typeof body.curriculum === "string") {
        body.curriculum = JSON.parse(body.curriculum);
      }

      body.curriculum.forEach((module) => {
        module.lessons.forEach((lesson) => {
          if (lesson.type === "video") {
            if (videoFiles[videoIndex]) {
              lesson.uploadVideo = videoFiles[videoIndex].path;
              videoIndex++;
            }
          } else if (lesson.type === "material") {
            if (materialFiles[materialIndex]) {
              lesson.materialUrl = materialFiles[materialIndex].path;
              materialIndex++;
            }
          }
          // Quiz data is already in lesson.quiz from the JSON body
        });
      });
    }

    // Create course
    const newCourse = await CourseModel.create(body);

    return res.status(201).json({
      status: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.log("Create Course Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

export const getCourses = async (req, res) => {
  try {
    const { category } = req.params;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Category filter (from params or query)
    // Handle "All" case-insensitively - don't filter when it's "All" or "all"
    if (category && category.toLowerCase() !== 'all') {
      filter.category = category;
    } else if (req.query.category && req.query.category.toLowerCase() !== 'all') {
      filter.category = req.query.category;
    }

    // Multiple categories filter
    if (req.query.categories) {
      const categories = Array.isArray(req.query.categories)
        ? req.query.categories
        : req.query.categories.split(',');
      filter.category = { $in: categories };
    }

    // Training mode filter
    if (req.query.modes) {
      const modes = Array.isArray(req.query.modes)
        ? req.query.modes
        : req.query.modes.split(',');
      filter.trainingOptions = { $in: modes };
    }

    // Level filter
    if (req.query.level) {
      filter.level = req.query.level;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.basePrice = {};
      if (req.query.minPrice) {
        filter.basePrice.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.basePrice.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Search filter (title, description, instructor)
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { instructorName: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first

    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'title':
          sortOption = { title: 1 };
          break;
        case 'price-low':
          sortOption = { basePrice: 1 };
          break;
        case 'price-high':
          sortOption = { basePrice: -1 };
          break;
        case 'rating':
          sortOption = { rating: -1 };
          break;
        case 'students':
          sortOption = { totalReviews: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    // Get total count for pagination
    const totalCourses = await CourseModel.countDocuments(filter);

    // Fetch courses with filters, sorting, and pagination
    const courses = await CourseModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sortOption)
      .select('-reviews'); // Exclude reviews array for performance

    return res.status(200).json({
      status: true,
      page,
      limit,
      totalCourses,
      totalPages: Math.ceil(totalCourses / limit),
      data: courses,
    });
  } catch (error) {
    console.error("Get Courses Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

// GET /course/:id
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id", id);

    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Course ID is required",
      });
    }

    const course = await CourseModel.findById(id);

    if (!course) {
      return res.status(404).json({
        status: false,
        message: "Course not found",
      });
    }

    // Find related courses by category excluding current course
    const relatedCourses = await CourseModel.find({
      category: course.category,
      _id: { $ne: id },
    }).limit(5);

    return res.status(200).json({
      status: true,
      data: course,
      related: relatedCourses,
    });
  } catch (error) {
    console.error("Get Course By ID Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

export const deleteAllCourse = async (req, res) => {
  try {
    await CourseModel.deleteMany({});
    return res.status(200).json({ message: "deleted sucessfully" });
  } catch (error) {
    console.error("Get Courses Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

// Get filter options (categories, training modes, levels)
export const getFilterOptions = async (req, res) => {
  try {
    const { COURSE_CATEGORY, COURSE_LEVEL, TrainingOptions } = await import("../common/courses.data.js");

    return res.status(200).json({
      status: true,
      data: {
        categories: Object.values(COURSE_CATEGORY),
        levels: Object.values(COURSE_LEVEL),
        trainingOptions: Object.values(TrainingOptions),
      },
    });
  } catch (error) {
    console.error("Get Filter Options Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

// Get popular courses (sorted by enrolledUsers count)
export const getPopularCourses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;

    // First, try to get courses with enrolledUsers (popular courses)
    // Use aggregation to sort by enrolledUsers array length
    const popularCourses = await CourseModel.aggregate([
      {
        $addFields: {
          enrolledCount: { $size: { $ifNull: ["$enrolledUsers", []] } }
        }
      },
      {
        $match: {
          enrolledCount: { $gt: 0 } // Only courses with at least 1 enrollment
        }
      },
      {
        $sort: { enrolledCount: -1 } // Sort by enrollment count descending
      },
      {
        $limit: limit
      },
      {
        $project: {
          reviews: 0 // Exclude reviews array for performance
        }
      }
    ]);

    // If we have popular courses, return them
    if (popularCourses && popularCourses.length > 0) {
      return res.status(200).json({
        status: true,
        data: popularCourses,
        count: popularCourses.length,
      });
    }

    // If no popular courses, get any 4 latest courses as fallback
    const fallbackCourses = await CourseModel.find({})
      .sort({ createdAt: -1 }) // Latest first
      .limit(limit)
      .select('-reviews');

    return res.status(200).json({
      status: true,
      data: fallbackCourses,
      count: fallbackCourses.length,
    });
  } catch (error) {
    logger.error("Get Popular Courses Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

// Enroll in a course
export const enrollCourse = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.userId; // From auth middleware

    if (!courseId) {
      return res.status(400).json({
        status: false,
        message: "Course ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "User not authenticated",
      });
    }

    // Find the course
    const course = await CourseModel.findById(courseId);

    if (!course) {
      return res.status(404).json({
        status: false,
        message: "Course not found",
      });
    }

    // Check if user is already enrolled
    if (course.enrolledUsers && course.enrolledUsers.includes(userId)) {
      return res.status(400).json({
        status: false,
        message: "You are already enrolled in this course",
      });
    }

    // Check if course has student limit and if it's reached
    if (course.studentLimit && course.enrolledUsers && course.enrolledUsers.length >= course.studentLimit) {
      return res.status(400).json({
        status: false,
        message: "Course enrollment limit reached",
      });
    }

    // Add user to enrolledUsers array
    if (!course.enrolledUsers) {
      course.enrolledUsers = [];
    }
    course.enrolledUsers.push(userId);
    await course.save();

    logger.info(`User ${userId} enrolled in course ${courseId}`);

    return res.status(200).json({
      status: true,
      message: "Successfully enrolled in course",
      data: {
        courseId: course._id,
        enrolledUsers: course.enrolledUsers.length,
      },
    });
  } catch (error) {
    logger.error("Enroll Course Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

// Get enrolled courses for authenticated user
export const getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.userId; // From authenticateMiddle

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "User not authenticated",
      });
    }

    // Find all courses where enrolledUsers array contains the userId
    const enrolledCourses = await CourseModel.find({
      enrolledUsers: { $in: [userId] }
    })
      .sort({ createdAt: -1 }) // Latest enrolled first
      .select('-reviews'); // Exclude reviews array for performance

    return res.status(200).json({
      status: true,
      data: enrolledCourses,
      count: enrolledCourses.length,
    });
  } catch (error) {
    logger.error("Get My Enrolled Courses Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
