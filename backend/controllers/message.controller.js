import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Offer from "../models/offer.model.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user?._id;
    const { receiverId, content } = req.body;

    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!receiverId || !content?.trim()) {
      return res
        .status(400)
        .json({ message: "Receiver and content are required" });
    }

    if (receiverId === String(senderId)) {
      return res
        .status(400)
        .json({ message: "You cannot send a message to yourself" });
    }

    const receiverExists = await User.exists({ _id: receiverId });

    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content: content.trim(),
    });

    return res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

export const getMessagesWithUser = async (req, res) => {
  try {
    const loggedInUserId = req.user?._id;
    const otherUserId = req.params.userId;

    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!otherUserId) {
      return res.status(400).json({ message: "User id is required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: loggedInUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({ messages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const getMessageContacts = async (req, res) => {
  try {
    const currentUserId = req.user?._id;
    const currentUserRole = req.user?.role || "user";

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let contacts = [];

    if (currentUserRole === "serviceProvider") {
      const acceptedOffers = await Offer.find({
        serviceProviderId: currentUserId,
        status: "accepted",
      })
        .populate({
          path: "jobId",
          select: "title userId jobStatus",
          populate: {
            path: "userId",
            select: "fullName",
          },
        })
        .lean();

      contacts = acceptedOffers
        .filter(
          (offer) =>
            offer.jobId?.jobStatus === "in-progress" && offer.jobId?.userId
        )
        .map((offer) => ({
          _id: offer.jobId.userId._id.toString(),
          fullName: offer.jobId.userId.fullName,
          jobId: offer.jobId._id.toString(),
          jobTitle: offer.jobId.title,
        }));
    } else {
      const inProgressJobs = await Job.find({
        userId: currentUserId,
        jobStatus: "in-progress",
      })
        .select("_id title")
        .lean();

      const jobIds = inProgressJobs.map((job) => job._id);

      if (jobIds.length) {
        const acceptedOffers = await Offer.find({
          jobId: { $in: jobIds },
          status: "accepted",
        })
          .populate("serviceProviderId", "fullName")
          .lean();

        const jobTitleLookup = inProgressJobs.reduce((acc, job) => {
          acc[job._id.toString()] = job.title;
          return acc;
        }, {});

        contacts = acceptedOffers
          .filter((offer) => offer.serviceProviderId)
          .map((offer) => ({
            _id: offer.serviceProviderId._id.toString(),
            fullName: offer.serviceProviderId.fullName,
            jobId: offer.jobId.toString(),
            jobTitle: jobTitleLookup[offer.jobId.toString()] || "",
          }));
      }
    }

    const deduped = [];
    const seen = new Set();

    contacts.forEach((contact) => {
      if (!seen.has(contact._id)) {
        seen.add(contact._id);
        deduped.push(contact);
      }
    });

    return res.status(200).json({ contacts: deduped });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to fetch contacts" });
  }
};
