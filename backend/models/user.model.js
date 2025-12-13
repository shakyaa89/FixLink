import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "provider", "admin"],
      default: "user",
    },
    profilePicture: { type: String, default: "" },
    address: { type: String },
    addressDescription: { type: String },
    addressURL: { type: String },
    reviewsReceived: [{ type: [String], default: [] }],
    ratingsReceived: [{ type: [Number], default: [] }],
    ratingAverage: { type: Number, default: 0 },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", ""],
      default: "",
    },
    verificationProofURL: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
