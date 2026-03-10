import Offer from "../models/offer.model.js";
import Job from "../models/job.model.js";

export const createOffer = async (req, res) => {
  try {
    const { jobId, offeredPrice } = req.body;

    if (!jobId || offeredPrice == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.jobStatus !== "open") {
      return res.status(400).json({ message: "Job is not open for offers" });
    }

    const serviceProviderId = req.user?.id || req.user?._id;
    if (!serviceProviderId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const existing = await Offer.findOne({
      jobId,
      serviceProviderId,
      status: "pending",
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You already have a pending offer for this job" });
    }

    const newOffer = new Offer({
      jobId,
      serviceProviderId,
      offeredPrice,
    });

    await newOffer.save();

    job.offers.push(newOffer._id);
    await job.save();

    return res.status(200).json({ message: "Offer created", offer: newOffer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const acceptOffer = async (req, res) => {
  try {
    const { offerId } = req.body;

    const userId = req.user._id;
    
    if (!offerId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if(!userId){
      return res.status(400).json({ message: "UserId is required" });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    if (offer.status !== "pending") {
      return res.status(400).json({ message: "Offer is not pending" });
    }

    const job = await Job.findById(offer.jobId);

    if(!job){
      return res.status(404).json({message: "The job is not found!"})
    }

    if (job.jobStatus !== "open") {
      return res.status(400).json({ message: "Job is not open" });
    }

    if(String(userId) !== String(job.userId)){
      return res.status(403).json({message: "You are not authorized to accept this offer"})
    }

    offer.status = "accepted";
    await offer.save();

    job.jobStatus = "in-progress";
    job.finalPrice = offer.offeredPrice;
    await job.save();

    return res.status(200).json({ message: "Offer accepted", offer: offer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
