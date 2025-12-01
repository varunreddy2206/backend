import UserModel from "../modals/user.modal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password } = req.body;

    // email already exists?
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      firstName,
      lastName,
      email,
      mobile,
      password: hashedPassword
    });

    logger.info(`New user created: ${newUser.email}`);

    return res.status(201).json({ message: "Signup successful", user: newUser });

  } catch (error) {
    logger.error("Signup error", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    logger.info(`User logged in: ${user.email}`);

    return res.status(200).json({ message: "Login successful", token, user });

  } catch (error) {
    logger.error("Login error", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    logger.info(`Profile fetched for user: ${user.email}`);

    return res.status(200).json({ message: "Profile fetched successfully", user });
  } catch (error) {
    logger.error("Get profile error", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, email, mobile, gender, dateOfBirth, currentPassword, newPassword } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Update profile fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await UserModel.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      user.email = email;
    }
    if (mobile !== undefined) user.mobile = mobile;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;

    await user.save();

    logger.info(`Profile updated for user: ${user.email}`);

    const updatedUser = await UserModel.findById(userId).select("-password");

    return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    logger.error("Update profile error", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save the image path (normalize to use forward slashes for URLs)
    const imagePath = req.file.path.replace(/\\/g, "/");
    user.profileImage = imagePath;

    await user.save();

    logger.info(`Profile image uploaded for user: ${user.email}`);

    const updatedUser = await UserModel.findById(userId).select("-password");

    return res.status(200).json({
      message: "Profile image uploaded successfully",
      user: updatedUser,
      profileImage: imagePath
    });
  } catch (error) {
    logger.error("Upload profile image error", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const getRegistrations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter for users with role "Users"
    const filter = { role: "Users" };

    // Optional: Add search functionality if needed later
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const totalUsers = await UserModel.countDocuments(filter);
    const users = await UserModel.find(filter)
      .select("-password") // Exclude password
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      status: true,
      message: "Registrations fetched successfully",
      data: {
        users,
        pagination: {
          totalUsers,
          totalPages: Math.ceil(totalUsers / limit),
          currentPage: page,
          limit,
        },
      },
    });
  } catch (error) {
    logger.error("Get registrations error", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get enrolled students (Users with at least one enrolled course)
export const getEnrolledStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter for users with role "Users" AND at least one enrolled course
    const filter = {
      role: "Users",
      enrolledCourses: { $exists: true, $not: { $size: 0 } }
    };

    // Optional: Add search functionality
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const totalStudents = await UserModel.countDocuments(filter);
    const students = await UserModel.find(filter)
      .select("-password") // Exclude password
      .populate("enrolledCourses", "title thumbnail") // Populate course details
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      status: true,
      message: "Students fetched successfully",
      data: {
        students,
        pagination: {
          totalStudents,
          totalPages: Math.ceil(totalStudents / limit),
          currentPage: page,
          limit,
        },
      },
    });
  } catch (error) {
    logger.error("Get enrolled students error", error);
    return res.status(500).json({ message: "Server error" });
  }
};