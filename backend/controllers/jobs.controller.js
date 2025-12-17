import Job from "../models/job.model.js";

export const createJob = async (req, res) => {
  const {
    title,
    description,
    jobCategory,
    userId,
    userPrice,
    address,
    addressURL,
  } = req.body;

  try {
    const newJob = new Job({
      userId,
      title,
      description,
      jobCategory,
      userPrice,
      address,
      addressURL,
    });

    await newJob.save();
    res.status(200).json({ message: "Job created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobs = await Job.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ jobs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to fetch jobs" });
  }
};
