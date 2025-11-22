import CourseModel from "../modals/course.model.js";

export const createCourse = async (req, res) => {
  try {
    const newCourse = await CourseModel.create(req.body);

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
    console.log("category", category);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter object
    const filter = {};
    if (category) {
      filter.category = category;
    }

    const totalCourses = await CourseModel.countDocuments(filter);

    const courses = await CourseModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

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
