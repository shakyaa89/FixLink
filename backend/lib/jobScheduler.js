import cron from "node-cron";
import Job from "../models/job.model.js";

export const startJobScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

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
      console.log("Job scheduler error:", error);
    }
  });
};
