import Review from "../models/review.model.js";
import Job from "../models/job.model.js";
import Offer from "../models/offer.model.js";
import User from "../models/user.model.js";

export const createReview = async (req, res) => {
  try {
    const reviewerId = req.user?._id;
    const { jobId, rating, comment } = req.body;

    if (!reviewerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!jobId || rating == null) {
      return res.status(400).json({ message: "Job and rating are required" });
    }

    const ratingNumber = Number(rating);
    if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.jobStatus !== "completed") {
      return res.status(400).json({ message: "Job is not completed" });
    }

    const acceptedOffer = await Offer.findOne({
      jobId,
      status: "accepted",
    });

    if (!acceptedOffer) {
      return res.status(400).json({ message: "No accepted offer found" });
    }

    const serviceProviderId = acceptedOffer.serviceProviderId?.toString();
    const jobOwnerId = job.userId?.toString();

    const reviewerIdString = reviewerId.toString();

    let revieweeId = null;
    if (reviewerIdString === jobOwnerId) {
      revieweeId = serviceProviderId;
    } else if (reviewerIdString === serviceProviderId) {
      revieweeId = jobOwnerId;
    }

    if (!revieweeId) {
      return res.status(403).json({ message: "Not allowed to review this job" });
    }

    const existingReview = await Review.findOne({
      jobId,
      reviewerId: reviewerIdString,
    });

    if (existingReview) {
      return res.status(409).json({ message: "Review already submitted" });
    }

    const newReview = await Review.create({
      jobId,
      reviewerId: reviewerIdString,
      revieweeId,
      rating: ratingNumber,
      comment: comment?.trim() || "",
    });

    const reviewStats = await Review.aggregate([
      { $match: { revieweeId: newReview.revieweeId } },
      {
        $group: {
          _id: "$revieweeId",
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    if (reviewStats.length) {
      await User.findByIdAndUpdate(newReview.revieweeId, {
        ratingAverage: reviewStats[0].avgRating,
      });
    }

    return res.status(201).json({ message: "Review submitted", review: newReview });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyReceivedReviews = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reviews = await Review.find({ revieweeId: userId })
      .populate("reviewerId", "fullName profilePicture")
      .populate("jobId", "title")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ reviews });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};
