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

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const recalculateUserRatingAverage = async (userId) => {
  const reviewStats = await Review.aggregate([
    { $match: { revieweeId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$revieweeId",
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  await User.findByIdAndUpdate(userId, {
    ratingAverage: reviewStats.length ? reviewStats[0].avgRating : 0,
  });
};

export const getAdminOverview = async (req, res) => {
  try {
    const [users, jobs, disputes] = await Promise.all([
      User.find()
        .select("fullName email role verificationStatus createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(), // .lean() returns plain js objects.
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

    return res.status(200).json({ users, jobs, disputes });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "fullName email role verificationStatus createdAt profilePicture providerCategory"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAdminUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

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

export const updateAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

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

    if (email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: userId } }).lean();
      if (emailTaken) {
        return res.status(409).json({ message: "Email already in use" });
      }
      currentUser.email = email;
    }

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

    await currentUser.save();

    const removedImageUrls = getRemovedCloudinaryUrls(previousImageUrls, [
      currentUser.profilePicture,
      currentUser.verificationProofURL,
      currentUser.idProofURL,
      currentUser.addressURL,
    ]);
    await deleteCloudinaryImagesByUrls(removedImageUrls);

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

export const deleteAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (String(userId) === String(adminId)) {
      return res.status(400).json({ message: "Admin cannot delete own account" });
    }

    const userJobs = await Job.find({ userId }).select("images").lean();

    const deletedUser = await User.findByIdAndDelete(userId).lean();

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userImageUrls = [
      deletedUser.profilePicture,
      deletedUser.verificationProofURL,
      deletedUser.idProofURL,
      deletedUser.addressURL,
    ];
    const jobImageUrls = userJobs.flatMap((job) =>
      Array.isArray(job.images) ? job.images : [],
    );
    await deleteCloudinaryImagesByUrls([...userImageUrls, ...jobImageUrls]);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("userId", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ jobs });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createAdminJob = async (req, res) => {
  try {
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

    return res
      .status(201)
      .json({ message: "Job created successfully", job: createdJob });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAdminJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await Job.findById(jobId)
      .populate("userId", "fullName")
      .populate({ path: "offers", populate: { path: "serviceProviderId", select: "fullName email" } })
      .lean();

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ job });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateAdminJob = async (req, res) => {
  try {
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

    await job.save();

    const removedImageUrls = getRemovedCloudinaryUrls(previousImages, job.images);
    await deleteCloudinaryImagesByUrls(removedImageUrls);

    const updatedJob = await Job.findById(jobId)
      .populate("userId", "fullName")
      .populate({ path: "offers", populate: { path: "serviceProviderId", select: "fullName email" } })
      .lean();

    return res.status(200).json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteAdminJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const deletedJob = await Job.findByIdAndDelete(jobId).lean();

    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    await deleteCloudinaryImagesByUrls(deletedJob.images);

    await Offer.deleteMany({ jobId });
    await Dispute.deleteMany({ jobId });
    await Review.deleteMany({ jobId });

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAdminDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("jobId", "title")
      .populate("reportedBy", "fullName")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({ disputes });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateAdminDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;

    if (!isValidObjectId(disputeId)) {
      return res.status(400).json({ message: "Invalid dispute id" });
    }

    const dispute = await Dispute.findById(disputeId);

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    const { title, description, status, priority, resolutionMessage } = req.body;

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

    return res.status(200).json({
      message: "Dispute updated successfully",
      dispute: updatedDispute,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteAdminDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;

    if (!isValidObjectId(disputeId)) {
      return res.status(400).json({ message: "Invalid dispute id" });
    }

    const dispute = await Dispute.findByIdAndDelete(disputeId).lean();

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    return res.status(200).json({ message: "Dispute deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAdminOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("jobId", "title")
      .populate("serviceProviderId", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ offers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateAdminOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    if (!isValidObjectId(offerId)) {
      return res.status(400).json({ message: "Invalid offer id" });
    }

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const { offeredPrice, status } = req.body;

    if (offeredPrice !== undefined) offer.offeredPrice = offeredPrice;
    if (status !== undefined && ["pending", "accepted", "rejected"].includes(status)) {
      offer.status = status;
    }

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

export const deleteAdminOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    if (!isValidObjectId(offerId)) {
      return res.status(400).json({ message: "Invalid offer id" });
    }

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.status === "accepted") {
      offer.status = "pending";
      await offer.save();

      await Job.findByIdAndUpdate(offer.jobId, {
        $set: { jobStatus: "open", finalPrice: 0 },
      });

      return res.status(200).json({
        message: "Accepted offer reset to pending successfully",
        offer,
      });
    }

    await Offer.findByIdAndDelete(offerId);

    await Job.findByIdAndUpdate(offer.jobId, { $pull: { offers: offer._id } });

    return res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("jobId", "title")
      .populate("reviewerId", "fullName email")
      .populate("revieweeId", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ reviews });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateAdminReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({ message: "Invalid review id" });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const { rating, comment } = req.body;

    if (rating !== undefined) {
      const ratingNumber = Number(rating);
      if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = ratingNumber;
    }

    if (comment !== undefined) review.comment = comment;

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

export const deleteAdminReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({ message: "Invalid review id" });
    }

    const review = await Review.findByIdAndDelete(reviewId).lean();

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await recalculateUserRatingAverage(review.revieweeId);

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAdminMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("senderId", "fullName email")
      .populate("receiverId", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ messages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateAdminMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({ message: "Invalid message id" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const { content } = req.body;

    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

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

export const deleteAdminMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({ message: "Invalid message id" });
    }

    const message = await Message.findByIdAndDelete(messageId).lean();

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAdminServiceProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: "serviceProvider" })
      .select(
        "fullName email phoneNumber profilePicture providerCategory verificationStatus verificationProofURL idProofURL address addressDescription addressURL createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ providers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateServiceProviderVerification = async (req, res) => {
  try {
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

    const provider = await User.findById(providerId);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (provider.role !== "serviceProvider") {
      return res.status(400).json({ message: "User is not a service provider" });
    }

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
