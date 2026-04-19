// Admin controller for dashboard and management actions
import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Dispute from "../models/dispute.model.js";
import Offer from "../models/offer.model.js";
import Review from "../models/review.model.js";
import Message from "../models/message.model.js";
import mongoose from "mongoose";
import {
  deleteCloudinaryImagesByUrls,
  getRemovedCloudinaryUrls,
} from "../lib/cloudinary.js";

// Check if a value is a valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Calculate average rating for a user
const recalculateUserRatingAverage = async (userId) => {
  // Aggregate average from all reviews for this user.
  const reviewStats = await Review.aggregate([
    { $match: { revieweeId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$revieweeId",
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  // Store 0 when user has no reviews.
  await User.findByIdAndUpdate(userId, {
    ratingAverage: reviewStats.length ? reviewStats[0].avgRating : 0,
  });
};

// Fetch users, jobs and disputes for admin dashboard
export const getAdminOverview = async (req, res) => {
  try {
    // Load recent users, jobs, and disputes in parallel.
    const [users, jobs, disputes] = await Promise.all([
      User.find()
        .select("fullName email role verificationStatus createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(), 
      Job.find()
        .populate("userId", "fullName")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Dispute.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
    ]);

  // Return compact dashboard overview.
    return res.status(200).json({ users, jobs, disputes });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fetch all users for admin
export const getAdminUsers = async (req, res) => {
  try {
    // Fetch users with admin-list fields only.
    const users = await User.find()
      .select(
        "fullName email role verificationStatus createdAt profilePicture providerCategory"
      )
      .sort({ createdAt: -1 })
      .lean();

  // Return users sorted by newest first.
    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fetch a user using ID
export const getAdminUserById = async (req, res) => {
  try {
    // Read target user id from params.
    const { userId } = req.params;

    // Validate id format before database query.
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // Exclude password from admin response.
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update user details for admin
export const updateAdminUser = async (req, res) => {
  try {
    // Read target user id from params.
    const { userId } = req.params;

    // Validation check
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // Fetch user and check if user exists
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousImageUrls = [
      currentUser.profilePicture,
      currentUser.verificationProofURL,
      currentUser.idProofURL,
      currentUser.addressURL,
    ];

    const {
      fullName,
      email,
      phoneNumber,
      city,
      role,
      profilePicture,
      address,
      addressDescription,
      addressURL,
      verificationStatus,
      providerCategory,
      verificationProofURL,
      idProofURL,
      rejectionReason,
      ratingAverage,
    } = req.body;

    // Validate unique email before update.
    // Duplicate email check
    if (email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: userId } }).lean();
      if (emailTaken) {
        return res.status(409).json({ message: "Email already in use" });
      }
      currentUser.email = email;
    }

    // Validate unique phone number before update.
    // Duplicate phone number check
    if (phoneNumber) {
      const phoneTaken = await User.findOne({
        phoneNumber,
        _id: { $ne: userId },
      }).lean();
      if (phoneTaken) {
        return res.status(409).json({ message: "Phone number already in use" });
      }
      currentUser.phoneNumber = phoneNumber;
    }

    if (fullName !== undefined) currentUser.fullName = fullName;
    if (city !== undefined) currentUser.city = city;
    if (profilePicture !== undefined) currentUser.profilePicture = profilePicture;
    if (address !== undefined) currentUser.address = address;
    if (addressDescription !== undefined) {
      currentUser.addressDescription = addressDescription;
    }
    if (addressURL !== undefined) currentUser.addressURL = addressURL;
    if (ratingAverage !== undefined) currentUser.ratingAverage = ratingAverage;

    if (role !== undefined && ["user", "serviceProvider", "admin"].includes(role)) {
      currentUser.role = role;
    }

    if (
      verificationStatus !== undefined &&
      ["pending", "verified", "rejected", ""].includes(verificationStatus)
    ) {
      currentUser.verificationStatus = verificationStatus;
    }

    if (providerCategory !== undefined) currentUser.providerCategory = providerCategory;
    if (verificationProofURL !== undefined) {
      currentUser.verificationProofURL = verificationProofURL;
    }
    if (idProofURL !== undefined) currentUser.idProofURL = idProofURL;
    if (rejectionReason !== undefined) currentUser.rejectionReason = rejectionReason;

    // Persist user updates first.
    await currentUser.save();

    const removedImageUrls = getRemovedCloudinaryUrls(previousImageUrls, [
      currentUser.profilePicture,
      currentUser.verificationProofURL,
      currentUser.idProofURL,
      currentUser.addressURL,
    ]);

    // Delete previous images in cloudinary
    await deleteCloudinaryImagesByUrls(removedImageUrls);

    // Return fresh user snapshot without password.
    const user = await User.findById(userId).select("-password").lean();

    return res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete user for admin
export const deleteAdminUser = async (req, res) => {
  try {
    // Read target and current admin ids.
    const { userId } = req.params;
    const adminId = req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // Prevent admin from deleting own account.
    if (String(userId) === String(adminId)) {
      return res.status(400).json({ message: "Admin cannot delete own account" });
    }

    // Collect user job images before deletion.
    const userJobs = await Job.find({ userId }).select("images").lean();

    const deletedUser = await User.findByIdAndDelete(userId).lean();

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Collect image URLs linked to this user
    const userImageUrls = [
      deletedUser.profilePicture,
      deletedUser.verificationProofURL,
      deletedUser.idProofURL,
      deletedUser.addressURL,
    ];

    const jobImageUrls = userJobs.flatMap((job) =>
      Array.isArray(job.images) ? job.images : [],
    );

    // Delete all related images from Cloudinary
    await deleteCloudinaryImagesByUrls([...userImageUrls, ...jobImageUrls]);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fetch all jobs for admin panel
export const getAdminJobs = async (req, res) => {
  try {
    // Fetch all jobs with job owner name.
    const jobs = await Job.find()
      .populate("userId", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    // Return jobs sorted by newest first.
    return res.status(200).json({ jobs });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Create a new job as admin
export const createAdminJob = async (req, res) => {
  try {
    // Read admin-created job payload.
    const {
      userId,
      title,
      description,
      jobCategory,
      userPrice,
      location,
      locationURL,
      images,
      scheduledFor,
      jobStatus,
      finalPrice,
    } = req.body;

    // Validate required fields before creation.
    if (
      !userId ||
      !title ||
      !description ||
      !jobCategory ||
      userPrice == null ||
      !location
    ) {
      return res.status(400).json({ message: "Missing required job fields" });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const owner = await User.findById(userId).lean();
    if (!owner) {
      return res.status(404).json({ message: "Job owner not found" });
    }

    // Create job with safe defaults for optional fields.
    const job = await Job.create({
      userId,
      title,
      description,
      jobCategory,
      userPrice,
      location,
      locationURL: locationURL || "",
      images: Array.isArray(images) ? images : [],
      scheduledFor: scheduledFor || null,
      jobStatus:
        jobStatus &&
        ["open", "scheduled", "in-progress", "cancelled", "completed"].includes(
          jobStatus,
        )
          ? jobStatus
          : "open",
      finalPrice: finalPrice ?? 0,
    });

    const createdJob = await Job.findById(job._id)
      .populate("userId", "fullName")
      .lean();

    // Return created job with owner name.
    return res
      .status(201)
      .json({ message: "Job created successfully", job: createdJob });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fetch one job by id for admin
export const getAdminJobById = async (req, res) => {
  try {
    // Read target job id from params.
    const { jobId } = req.params;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    // Populate owner and offer provider details.
    const job = await Job.findById(jobId)
      .populate("userId", "fullName")
      .populate({ path: "offers", populate: { path: "serviceProviderId", select: "fullName email" } })
      .lean();

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Return full admin job view.
    return res.status(200).json({ job });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update job details as admin
export const updateAdminJob = async (req, res) => {
  try {
    // Read target job id from params.
    const { jobId } = req.params;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const previousImages = Array.isArray(job.images) ? [...job.images] : [];

    const {
      userId,
      title,
      description,
      jobCategory,
      userPrice,
      finalPrice,
      location,
      locationURL,
      images,
      scheduledFor,
      jobStatus,
      offers,
    } = req.body;

    // Optionally move job to another owner.
    if (userId !== undefined) {
      if (!isValidObjectId(userId)) {
        return res.status(400).json({ message: "Invalid user id" });
      }

      const owner = await User.findById(userId).lean();
      if (!owner) {
        return res.status(404).json({ message: "Job owner not found" });
      }

      job.userId = userId;
    }

    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (jobCategory !== undefined) job.jobCategory = jobCategory;
    if (userPrice !== undefined) job.userPrice = userPrice;
    if (finalPrice !== undefined) job.finalPrice = finalPrice;
    if (location !== undefined) job.location = location;
    if (locationURL !== undefined) job.locationURL = locationURL;
    if (images !== undefined && Array.isArray(images)) job.images = images;
    if (scheduledFor !== undefined) job.scheduledFor = scheduledFor;
    if (
      jobStatus !== undefined &&
      ["open", "scheduled", "in-progress", "cancelled", "completed"].includes(
        jobStatus,
      )
    ) {
      job.jobStatus = jobStatus;
    }

    if (offers !== undefined && Array.isArray(offers)) {
      const validOfferIds = offers.every((offerId) => isValidObjectId(offerId));
      if (!validOfferIds) {
        return res.status(400).json({ message: "Invalid offer id in offers list" });
      }
      job.offers = offers;
    }

    // Save changes before cleaning old images.
    await job.save();

    const removedImageUrls = getRemovedCloudinaryUrls(previousImages, job.images);
    await deleteCloudinaryImagesByUrls(removedImageUrls);

    const updatedJob = await Job.findById(jobId)
      .populate("userId", "fullName")
      .populate({ path: "offers", populate: { path: "serviceProviderId", select: "fullName email" } })
      .lean();

    // Return updated job snapshot.
    return res.status(200).json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete a job and linked records as admin
export const deleteAdminJob = async (req, res) => {
  try {
    // Read target job id from params.
    const { jobId } = req.params;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const deletedJob = await Job.findByIdAndDelete(jobId).lean();

    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Delete linked media and related records.
    await deleteCloudinaryImagesByUrls(deletedJob.images);

    await Offer.deleteMany({ jobId });
    await Dispute.deleteMany({ jobId });
    await Review.deleteMany({ jobId });

    // Confirm successful job cleanup.
    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fetch all disputes for admin
export const getAdminDisputes = async (req, res) => {
  try {
    // Fetch all disputes with job and reporter info.
    const disputes = await Dispute.find()
      .populate("jobId", "title")
      .populate("reportedBy", "fullName")
      .sort({ updatedAt: -1 })
      .lean();

  // Return disputes sorted by latest updates.
    return res.status(200).json({ disputes });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update a dispute as admin
export const updateAdminDispute = async (req, res) => {
  try {
    // Read target dispute id from params.
    const { disputeId } = req.params;

    if (!isValidObjectId(disputeId)) {
      return res.status(400).json({ message: "Invalid dispute id" });
    }

    const dispute = await Dispute.findById(disputeId);

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    // Read editable dispute fields from request.
    const { title, description, status, priority, resolutionMessage } = req.body;

    // Compute effective status and transition intent.
    const isValidStatus =
      status !== undefined ? ["open", "resolved"].includes(status) : false;
    const nextStatus = isValidStatus ? status : dispute.status;
    const isResolvingNow = dispute.status !== "resolved" && nextStatus === "resolved";

    if (isResolvingNow && (!resolutionMessage || !resolutionMessage.trim())) {
      return res
        .status(400)
        .json({ message: "Resolution message is required when resolving a dispute" });
    }

    if (title !== undefined) dispute.title = title;
    if (description !== undefined) dispute.description = description;
    if (isValidStatus) {
      dispute.status = status;
    }
    if (priority !== undefined && ["low", "medium", "high"].includes(priority)) {
      dispute.priority = priority;
    }

    if (nextStatus === "open") {
      dispute.resolutionMessage = "";
    } else if (resolutionMessage !== undefined) {
      dispute.resolutionMessage = resolutionMessage.trim();
    }

    await dispute.save();

    const updatedDispute = await Dispute.findById(disputeId)
      .populate("jobId", "title")
      .populate("reportedBy", "fullName")
      .lean();

    // Return updated dispute details.
    return res.status(200).json({
      message: "Dispute updated successfully",
      dispute: updatedDispute,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete a dispute as admin
export const deleteAdminDispute = async (req, res) => {
  try {
    // Read target dispute id from params.
    const { disputeId } = req.params;

    if (!isValidObjectId(disputeId)) {
      return res.status(400).json({ message: "Invalid dispute id" });
    }

    const dispute = await Dispute.findByIdAndDelete(disputeId).lean();

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    // Confirm successful dispute deletion.
    return res.status(200).json({ message: "Dispute deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fetch all offers for admin
export const getAdminOffers = async (req, res) => {
  try {
    // Fetch offers with job and provider details.
    const offers = await Offer.find()
      .populate("jobId", "title")
      .populate("serviceProviderId", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

  // Return offers sorted by newest first.
    return res.status(200).json({ offers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update an offer as admin
export const updateAdminOffer = async (req, res) => {
  try {
    // Read target offer id from params.
    const { offerId } = req.params;

    if (!isValidObjectId(offerId)) {
      return res.status(400).json({ message: "Invalid offer id" });
    }

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Apply only allowed offer fields.
    const { offeredPrice, status } = req.body;

    if (offeredPrice !== undefined) offer.offeredPrice = offeredPrice;
    if (status !== undefined && ["pending", "accepted", "rejected"].includes(status)) {
      offer.status = status;
    }

    // Save and return populated offer snapshot.
    await offer.save();

    const updatedOffer = await Offer.findById(offerId)
      .populate("jobId", "title")
      .populate("serviceProviderId", "fullName email")
      .lean();

    return res.status(200).json({
      message: "Offer updated successfully",
      offer: updatedOffer,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete an offer as admin
export const deleteAdminOffer = async (req, res) => {
  try {
    // Read target offer id from params.
    const { offerId } = req.params;

    if (!isValidObjectId(offerId)) {
      return res.status(400).json({ message: "Invalid offer id" });
    }

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Remove offer and unlink it from parent job.
    await Offer.findByIdAndDelete(offerId);
    await Job.findByIdAndUpdate(offer.jobId, { $pull: { offers: offer._id } });

    if (offer.status === "accepted") {
        // Reopen job if the accepted offer is removed.
        await Job.findByIdAndUpdate(offer.jobId, { $set: { jobStatus: "open", finalPrice: 0 } });

      return res.status(200).json({
        message: "Accepted offer deleted and job reset successfully",
      });
    }

    return res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fetch all reviews for admin
export const getAdminReviews = async (req, res) => {
  try {
    // Fetch reviews with related job and user details.
    const reviews = await Review.find()
      .populate("jobId", "title")
      .populate("reviewerId", "fullName email")
      .populate("revieweeId", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

  // Return reviews sorted by newest first.
    return res.status(200).json({ reviews });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update a review as admin
export const updateAdminReview = async (req, res) => {
  try {
    // Read target review id from params.
    const { reviewId } = req.params;

    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({ message: "Invalid review id" });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Read editable review fields.
    const { rating, comment } = req.body;

    if (rating !== undefined) {
      const ratingNumber = Number(rating);
      if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = ratingNumber;
    }

    if (comment !== undefined) review.comment = comment;

    // Save review then recompute reviewee average.
    await review.save();
    await recalculateUserRatingAverage(review.revieweeId);

    const updatedReview = await Review.findById(reviewId)
      .populate("jobId", "title")
      .populate("reviewerId", "fullName email")
      .populate("revieweeId", "fullName email")
      .lean();

    return res.status(200).json({
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete a review as admin
export const deleteAdminReview = async (req, res) => {
  try {
    // Read target review id from params.
    const { reviewId } = req.params;

    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({ message: "Invalid review id" });
    }

    const review = await Review.findByIdAndDelete(reviewId).lean();

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Recompute rating after removing this review.
    await recalculateUserRatingAverage(review.revieweeId);

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fetch all messages for admin
export const getAdminMessages = async (req, res) => {
  try {
    // Fetch all messages with sender/receiver info.
    const messages = await Message.find()
      .populate("senderId", "fullName email")
      .populate("receiverId", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

  // Return messages sorted by newest first.
    return res.status(200).json({ messages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update a message as admin
export const updateAdminMessage = async (req, res) => {
  try {
    // Read target message id from params.
    const { messageId } = req.params;

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({ message: "Invalid message id" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Read and validate new message content.
    const { content } = req.body;

    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Save and return populated message data.
    message.content = String(content).trim();
    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate("senderId", "fullName email")
      .populate("receiverId", "fullName email")
      .lean();

    return res.status(200).json({
      message: "Message updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete a message as admin
export const deleteAdminMessage = async (req, res) => {
  try {
    // Read target message id from params.
    const { messageId } = req.params;

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({ message: "Invalid message id" });
    }

    const message = await Message.findByIdAndDelete(messageId).lean();

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Confirm successful message deletion.
    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fetch all service providers for admin
export const getAdminServiceProviders = async (req, res) => {
  try {
    // Fetch service providers with verification fields.
    const providers = await User.find({ role: "serviceProvider" })
      .select(
        "fullName email phoneNumber profilePicture providerCategory verificationStatus verificationProofURL idProofURL address addressDescription addressURL createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

  // Return providers sorted by newest first.
    return res.status(200).json({ providers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update service provider verification status
export const updateServiceProviderVerification = async (req, res) => {
  try {
    // Read provider id and verification update fields.
    const { providerId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!providerId) {
      return res.status(400).json({ message: "Provider id is required" });
    }

    if (!status || !["pending", "verified", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be pending, verified, or rejected" });
    }

    if (status === "rejected" && (!rejectionReason || !rejectionReason.trim())) {
      return res
        .status(400)
        .json({ message: "Rejection reason is required" });
    }

    // Ensure target user exists and is a provider.
    const provider = await User.findById(providerId);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (provider.role !== "serviceProvider") {
      return res.status(400).json({ message: "User is not a service provider" });
    }

    // Save status and optional rejection reason.
    provider.verificationStatus = status;
    if (status === "rejected") {
      provider.rejectionReason = rejectionReason.trim();
    } else {
      provider.rejectionReason = "";
    }
    await provider.save();

    return res.status(200).json({
      message: "Verification status updated",
      provider,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};
