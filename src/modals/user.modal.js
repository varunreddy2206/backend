import mongoose from "mongoose";
const { Schema } = mongoose;

const UserUserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Users"], default: "Users" },
  //   address: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: null },
  gender: { type: String, default: null },
  dateOfBirth: { type: String, default: null },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
});

const UserModel = mongoose.model("User", UserUserSchema);
export default UserModel;
