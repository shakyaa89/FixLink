// Dispute controller for creating and listing disputes
import Dispute from "../models/dispute.model.js";
import Job from "../models/job.model.js";
import Offer from "../models/offer.model.js";

// Fetch disputes reported by logged-in user
export const getMyDisputes = async (req, res) => {
	try {
		// Read user id from auth payload.
		const userId = req.user?.id || req.user?._id;

		// Stop if auth context is missing.
		if (!userId) {
			return res.status(401).json({ message: "User not authorized" });
		}

		// Load user disputes with basic job info.
		const disputes = await Dispute.find({ reportedBy: userId })
			.populate("jobId", "title")
			.sort({ createdAt: -1 })
			.lean();

		// Return newest disputes first.
		return res.status(200).json({ disputes });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

// Fetch jobs that can be disputed by user
export const getDisputableJobs = async (req, res) => {
	try {
		// Read user id from auth payload.
		const userId = req.user?.id || req.user?._id;

		// Stop if auth context is missing.
		if (!userId) {
			return res.status(401).json({ message: "User not authorized" });
		}

		// Fetch owner jobs and accepted-provider jobs in parallel.
		const [ownerJobs, acceptedOffers] = await Promise.all([
			Job.find({
				userId,
				jobStatus: { $in: ["in-progress", "completed", "cancelled"] },
			})
				.select("title jobStatus createdAt")
				.sort({ createdAt: -1 })
				.lean(),
			Offer.find({ serviceProviderId: userId, status: "accepted" })
				.select("jobId")
				.lean(),
		]);

		// Build job id list from accepted offers.
		const providerJobIds = acceptedOffers.map((offer) => offer.jobId);

		const providerJobs = providerJobIds.length
			? await Job.find({
					_id: { $in: providerJobIds },
					jobStatus: { $in: ["in-progress", "completed", "cancelled"] },
			  })
					.select("title jobStatus createdAt")
					.sort({ createdAt: -1 })
					.lean()
			: [];

		// Merge owner and provider jobs without duplicates.
		const uniqueJobs = [...ownerJobs, ...providerJobs].reduce((acc, job) => {
			acc.set(job._id.toString(), job);
			return acc;
		}, new Map());

		// Send a unique list of disputable jobs.
		return res.status(200).json({ jobs: Array.from(uniqueJobs.values()) });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

// Create dispute for an eligible job
export const createDispute = async (req, res) => {
	try {
		// Read actor and payload fields.
		const userId = req.user?.id || req.user?._id;
		const { jobId, title, description, priority } = req.body;

		// Stop if auth context is missing.
		if (!userId) {
			return res.status(401).json({ message: "User not authorized" });
		}

		// Require minimum dispute fields.
		if (!jobId || !title) {
			return res
				.status(400)
				.json({ message: "Job and dispute title are required" });
		}

		// Load only fields needed for access checks.
		const job = await Job.findById(jobId).select("userId jobStatus").lean();

		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		if (!["in-progress", "completed", "cancelled"].includes(job.jobStatus)) {
			return res.status(400).json({
				message:
					"Disputes can only be created for accepted, completed, or cancelled jobs",
			});
		}

		const isJobOwner = job.userId?.toString() === userId.toString();
		const isAcceptedProvider =
			(await Offer.exists({
				jobId,
				serviceProviderId: userId,
				status: "accepted",
			})) !== null;

		// Owners can always dispute eligible jobs.
		if (isJobOwner) {
			const dispute = await Dispute.create({
				jobId,
				title,
				description: description || "",
				priority: ["low", "medium", "high"].includes(priority)
					? priority
					: "medium",
				status: "open",
				reportedBy: userId,
			});

			return res.status(201).json({
				message: "Dispute created successfully",
				dispute,
			});
		}

		if (!isAcceptedProvider) {
			return res.status(403).json({
				message:
					"Service providers can only create disputes for jobs where their offer is accepted",
			});
		}

		// Same create flow is used for accepted providers.
		const dispute = await Dispute.create({
			jobId,
			title,
			description: description || "",
			priority: ["low", "medium", "high"].includes(priority)
				? priority
				: "medium",
			status: "open",
			reportedBy: userId,
		});

		return res.status(201).json({
			message: "Dispute created successfully",
			dispute,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};
