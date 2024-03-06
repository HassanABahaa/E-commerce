import { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";

const userShema = new Schema(
  {
    userName: { type: String, required: true, min: 3, max: 20 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    isConfirmed: { type: Boolean, default: false },
    gender: { type: String, enum: ["male", "female"] },
    phone: { type: String },
    role: { type: String, enum: ["seller", "user", "admin"], default: "user" },
    forgetCode: String,
    profileImage: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/da74bfjeu/image/upload/v1707941072/E-commerce/Users/defaults/profilePic/images_bzb77b.jpg",
      },
      id: {
        type: String,
        default: "E-commerce/Users/defaults/profilePic/images_bzb77b",
      },
    },
    coverImages: [{ url: { type: String }, id: { type: String } }],
  },
  { timestamps: true }
);

// save user check password >>> hashing
userShema.pre("save", function () {
  if (this.isModified("password")) {
    this.password = bcryptjs.hashSync(
      this.password,
      parseInt(process.env.SALT_ROUND)
    );
  }
});

export const User = model("User", userShema);
