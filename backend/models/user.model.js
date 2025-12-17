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
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "serviceProvider", "admin"],
      default: "user",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    address: {
      type: String,
    },
    addressDescription: {
      type: String,
    },
    addressURL: {
      type: String,
    },
    reviewsReceived: [
      {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Review",
        default: [],
      },
    ],
    ratingAverage: {
      type: Number,
      default: 0,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", ""],
      default: "",
    },
    verificationProofURL: {
      type: String,
      default: "",
    },
    idProofURL: {
      type: String,
      default: "",
    },
    providerCategory: {
      type: String,
      enum: [
        "Plumbing",
        "Electrical",
        "Carpentry",
        "Painting",
        "Landscaping",
        "General Repairs",
        "",
      ],
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
