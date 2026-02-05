import Job from "../models/job.model.js";
import Offer from "../models/offer.model.js";

export const createJob = async (req, res) => {
  const {
    title,
    description,
    jobCategory,
    userId,
    userPrice,
    location,
    locationURL,
    images,
  } = req.body;

  try {
    const newJob = new Job({
      userId,
      title,
      description,
      jobCategory,
      userPrice,
      location,
      locationURL,
      images,
    });

    await newJob.save();
    res.status(200).json({ message: "Job created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getJobsbyUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobs = await Job.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ jobs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.status(200).json({ jobs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId)
      .populate("userId")
      .populate({
        path: "offers",
        populate: {
          path: "serviceProviderId",
          model: "User",
        },
      });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.status(200).json({ job });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to fetch job" });
  }
};

export const getJobsForProvider = async (req, res) => {
  try {
    const { category } = req.query;
    const serviceProviderId = req.user?.id || req.user?._id;

    if (!category) {
      return res.status(400).json({
        message: "Provider category is required",
      });
    }

    if (!serviceProviderId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const providerOffers = await Offer.find({ serviceProviderId }).select(
      "jobId",
    );

    const providerJobIds = [...new Set(providerOffers.map((o) => o.jobId))];

    const jobs = await Job.find({
      jobCategory: category,
      $or: [{ jobStatus: "open" }, { _id: { $in: providerJobIds } }],
    })
      .populate({
        path: "offers",
        populate: {
          path: "serviceProviderId",
          model: "User",
        },
      })
      .populate("userId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch jobs",
    });
  }
};

export const cancelJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.jobStatus === "cancelled") {
      console.log(job.jobStatus);

      return res
        .status(400)
        .json({ message: "Job is not open for cancellation" });
    }
    job.jobStatus = "cancelled";
    await job.save();
    return res.status(200).json({ message: "Job cancelled successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const completeJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.jobStatus === "completed") {
      return res.status(400).json({ message: "Job is already completed" });
    }

    job.jobStatus = "completed";
    await job.save();
    return res.status(200).json({ message: "Job completed!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};
