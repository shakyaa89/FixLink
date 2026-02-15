import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Dispute from "../models/dispute.model.js";

export const getAdminOverview = async (req, res) => {
  try {
    const [users, jobs, disputes] = await Promise.all([
      User.find()
        .select("fullName email role verificationStatus createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(), // returns plain js objects.
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
    const { status } = req.body;

    if (!providerId) {
      return res.status(400).json({ message: "Provider id is required" });
    }

    if (!status || !["verified", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be verified or rejected" });
    }

    const provider = await User.findById(providerId);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (provider.role !== "serviceProvider") {
      return res.status(400).json({ message: "User is not a service provider" });
    }

    provider.verificationStatus = status;
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
