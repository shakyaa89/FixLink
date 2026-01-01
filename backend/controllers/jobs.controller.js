import Job from "../models/job.model.js";

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

    if (!category) {
      return res.status(400).json({
        message: "Provider category is required",
      });
    }

    const jobs = await Job.find({
      jobCategory: category,
      jobStatus: "open",
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
