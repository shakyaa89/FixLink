import Job from "../models/job.model.js";
import Offer from "../models/offer.model.js";

const MIN_PRICE = 1;
const MAX_PRICE = 1000000;
const ALLOWED_JOB_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Landscaping",
  "General Repairs",
];

const isValidPrice = (value) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= MIN_PRICE &&
  value <= MAX_PRICE;

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isValidUrl = (value) => {
  if (value === "") {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const getValidatedScheduleDate = (scheduledFor) => {
  const parsedScheduledFor = new Date(scheduledFor);

  if (Number.isNaN(parsedScheduledFor.getTime())) {
    return { error: "Invalid schedule date" };
  }

  const now = new Date();
  const maxScheduleDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (parsedScheduledFor <= now) {
    return { error: "Scheduled time must be in the future" };
  }

  if (parsedScheduledFor > maxScheduleDate) {
    return { error: "Jobs can only be scheduled up to 1 week ahead" };
  }

  return { parsedScheduledFor };
};

export const createJob = async (req, res) => {
  const {
    title,
    description,
    jobCategory,
    userPrice,
    location,
    locationURL,
    images,
  } = req.body;

  const user_id = req.user._id;

  try {
    if (!isValidPrice(userPrice)) {
      return res.status(400).json({
        message: `Price must be a number between ${MIN_PRICE} and ${MAX_PRICE}`,
      });
    }

    if(!title ||
    !description ||
    !jobCategory ||
    !userPrice ||
    !location){
      return res.status(400).json({
        message: "Fields are empty!"
      })
    }

    const newJob = new Job({
      userId: user_id,
      title,
      description,
      jobCategory,
      userPrice,
      location,
      locationURL,
      images,
      scheduledFor: null,
      jobStatus: "open",
    });

    await newJob.save();

    res.status(200).json({ message: "Job created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const scheduleJob = async (req, res) => {
  const {
    title,
    description,
    jobCategory,
    userPrice,
    location,
    locationURL,
    images,
    scheduledFor,
  } = req.body;

  const user_id = req.user._id;

  try {
    if (!isValidPrice(userPrice)) {
      return res.status(400).json({
        message: `Price must be a number between ${MIN_PRICE} and ${MAX_PRICE}`,
      });
    }

    if (!scheduledFor) {
      return res.status(400).json({ message: "Scheduled time is required" });
    }

    const { parsedScheduledFor, error } = getValidatedScheduleDate(
      scheduledFor,
    );

    if (error) {
      return res.status(400).json({ message: error });
    }

    const newJob = new Job({
      userId: user_id,
      title,
      description,
      jobCategory,
      userPrice,
      location,
      locationURL,
      images,
      scheduledFor: parsedScheduledFor,
      jobStatus: "scheduled",
    });

    await newJob.save();

    res.status(200).json({ message: "Job scheduled successfully" });
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
    const now = new Date();

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
      $or: [
        { jobStatus: "open" },
        { jobStatus: "scheduled", scheduledFor: { $lte: now } },
        { _id: { $in: providerJobIds } },
      ],
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

    const userId = req.user._id;

    if(!userId){
      return res.status(404).json({message: "User not found!"})
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.jobStatus === "cancelled") {
      return res
        .status(400)
        .json({ message: "Job is not open for cancellation" });
    }

    if(String(job.userId) !== String(userId)){
      return res.status(403).json({message: "You are not permitted to cancel this job!"})
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

    const userId = req.user._id;

    if(!userId){
      return res.status(404).json({message: "User not found!"})
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.jobStatus !== "in-progress") {
      return res.status(400).json({ message: "Job is not in progress" });
    }

    const acceptedOffer = await Offer.findOne({ jobId, status: "accepted" });
    if (!acceptedOffer) {
      return res.status(400).json({ message: "No accepted offer for this job" });
    }

    if (String(acceptedOffer.serviceProviderId) !== String(userId)) {
      return res.status(403).json({
        message: "You are not permitted to complete this job!",
      });
    }

    job.jobStatus = "completed";
    await job.save();
    return res.status(200).json({ message: "Job completed!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateJobByUser = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (String(job.userId) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "You are not permitted to update this job" });
    }

    if (!["open", "scheduled"].includes(job.jobStatus)) {
      return res.status(400).json({
        message: "Only open or scheduled jobs can be updated",
      });
    }

    const {
      title,
      description,
      jobCategory,
      userPrice,
      location,
      locationURL,
      images,
    } = req.body;

    const hasUpdatableField =
      title !== undefined ||
      description !== undefined ||
      jobCategory !== undefined ||
      userPrice !== undefined ||
      location !== undefined ||
      locationURL !== undefined ||
      images !== undefined;

    if (!hasUpdatableField) {
      return res.status(400).json({
        message: "Provide at least one field to update",
      });
    }

    if (title !== undefined) {
      if (!isNonEmptyString(title)) {
        return res.status(400).json({ message: "Title is required" });
      }
      job.title = title.trim();
    }

    if (description !== undefined) {
      if (!isNonEmptyString(description)) {
        return res.status(400).json({ message: "Description is required" });
      }
      job.description = description.trim();
    }

    if (jobCategory !== undefined) {
      if (!ALLOWED_JOB_CATEGORIES.includes(jobCategory)) {
        return res.status(400).json({ message: "Invalid job category" });
      }
      job.jobCategory = jobCategory;
    }

    if (userPrice !== undefined) {
      if (!isValidPrice(userPrice)) {
        return res.status(400).json({
          message: `Price must be a number between ${MIN_PRICE} and ${MAX_PRICE}`,
        });
      }
      job.userPrice = userPrice;
    }

    if (location !== undefined) {
      if (!isNonEmptyString(location)) {
        return res.status(400).json({ message: "Location is required" });
      }
      job.location = location.trim();
    }

    if (locationURL !== undefined) {
      if (typeof locationURL !== "string" || !isValidUrl(locationURL)) {
        return res.status(400).json({ message: "Invalid location URL" });
      }
      job.locationURL = locationURL.trim();
    }

    if (images !== undefined) {
      if (!Array.isArray(images) || !images.every((img) => isValidUrl(img))) {
        return res.status(400).json({ message: "Invalid images payload" });
      }
      job.images = images;
    }

    await job.save();

    return res.status(200).json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};
