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

    return res.status(200).json({ message: "Login successful", token });

  } catch (error) {
    logger.error("Login error", error);
    return res.status(500).json({ message: "Server error" });
  }
};
