// Message controller for chat and message history
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Offer from "../models/offer.model.js";
import { getIO } from "../lib/socket.js";

// Send message from one user to another
export const sendMessage = async (req, res) => {
  try {
    // Read sender from auth and payload from body.
    const senderId = req.user?._id;
    const { receiverId, content } = req.body;

    // Block unauthenticated requests.
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

    // Add chat message in database.
    const message = await Message.create({
      senderId,
      receiverId,
      content: content.trim(),
    });

    // Normalize ids to strings for socket clients.
    const payload = message.toObject();
    payload._id = String(message._id);
    payload.senderId = String(message.senderId);
    payload.receiverId = String(message.receiverId);

    try {
      const io = getIO();
      io.to(String(receiverId))
        .to(String(senderId))
        .emit("message:new", payload);
    } catch (socketError) {
      console.log("Socket emit failed", socketError);
    }

    // Return stored message to caller.
    return res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

// Fetch chat messages between two users
export const getMessagesWithUser = async (req, res) => {
  try {
    // Read current user and other participant id.
    const loggedInUserId = req.user?._id;
    const otherUserId = req.params.userId;

    // Block unauthenticated requests.
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!otherUserId) {
      return res.status(400).json({ message: "User id is required" });
    }

    // Fetch both directions of the same chat thread.
    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: loggedInUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    // Send messages in ascending time order.
    return res.status(200).json({ messages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// Fetch available message contacts for user
export const getMessageContacts = async (req, res) => {
  try {
    // Read user identity and role from auth context.
    const currentUserId = req.user?._id;
    const currentUserRole = req.user?.role || "user";

    // Block unauthenticated requests.
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let contacts = [];

    if (currentUserRole === "serviceProvider") {
      // For providers, contacts are owners of in-progress accepted jobs.
      const acceptedOffers = await Offer.find({
        serviceProviderId: currentUserId,
        status: "accepted",
      })
        .populate({
          path: "jobId",
          select: "title userId jobStatus",
          populate: {
            path: "userId",
            select: "fullName profilePicture",
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
          profilePicture: offer.jobId.userId.profilePicture || "",
          jobId: offer.jobId._id.toString(),
          jobTitle: offer.jobId.title,
        }));
    } else {
      // For users, contacts are accepted providers on in-progress jobs.
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
          .populate("serviceProviderId", "fullName profilePicture")
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
            profilePicture: offer.serviceProviderId.profilePicture || "",
            jobId: offer.jobId.toString(),
            jobTitle: jobTitleLookup[offer.jobId.toString()] || "",
          }));
      }
    }

    const deduped = [];
    const seen = new Set();

    // Same contact can appear via multiple active jobs.
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
