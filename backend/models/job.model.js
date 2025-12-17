import mongoose from "mongoose";

const jobSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    offers: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    title: {
      type: String,
      required: true,
    },
    jobCategory: {
      type: String,
      enum: [
        "Plumbing",
        "Electrical",
        "Carpentry",
        "Painting",
        "Landscaping",
        "General Repairs",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    userPrice: {
      type: Number,
      required: true,
    },
    finalPrice: {
      type: Number,
      default: "",
    },
    location: {
      type: String,
      required: true,
    },
    locationURL: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    jobStatus: {
      type: String,
      enum: ["pending", "accepted", "cancelled", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);

export default mongoose.models.Job || Job;
