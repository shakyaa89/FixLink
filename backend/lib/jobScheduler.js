// Background scheduler for automatic job updates
import cron from "node-cron";
import Job from "../models/job.model.js";

export const startJobScheduler = () => {
  // Run every minute to check scheduled jobs.
  cron.schedule("* * * * *", async () => {
    try {
      // Use current time as schedule cutoff.
      const now = new Date();

      // Open jobs whose scheduled time has arrived.
      await Job.updateMany(
        {
          jobStatus: "scheduled",
          scheduledFor: { $ne: null, $lte: now },
        },
        {
          $set: { jobStatus: "open" },
        },
      );
    } catch (error) {
      // Log scheduler errors without stopping cron.
      console.log("Job scheduler error:", error);
    }
  });
};
