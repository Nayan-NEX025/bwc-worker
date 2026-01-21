import { Worker } from "bullmq";
import redis from "../../configs/redis.js";
import EmailCampaign from "../../modules/email/campaigns/emailCampaign.model.js";
import { sendBrevoCampaign } from "../../modules/email/campaigns/emailCampaign.service.js";
import dbConnect from "../../configs/db.config.js";
dbConnect(); // BullMQ workers are separate Node processes. Every worker must initialize its own DB, Redis, and env. They are independent services, not threads.
console.log("Email campaign Worker is running.");

// scheduled campaign
export const emailCampaignWorker = new Worker(
  "email-campaign-queue",
  async (job) => {
    console.log("inside the email campaign worker....");
    const { campaignId } = job.data;

    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) return;

    // Idempotency guard
    if (campaign.status !== "scheduled") return;
    campaign.status = "processing";
    campaign.startedAt = new Date();
    await campaign.save();

    await sendBrevoCampaign(campaign.brevoCampaignId);

    campaign.status = "sent";
    campaign.completedAt = new Date();
    await campaign.save();
    console.log("campaign is sent");
  },
  {
    connection: redis,
    concurrency: 5,
  },
);

emailCampaignWorker.on("completed", (job) => {
  console.log(
    `${new Date.toLocaleString()} Email campaign job completed`,
  );
});

emailCampaignWorker.on("failed", (job) => {
  console.log(
    `${new Date.toLocaleString()}  Email campaign job failed`,
    job?.id,
    err?.message,
  );
});

emailCampaignWorker.on("progress", (job) => {
  console.log(
    `${new Date.toLocaleString()}  Email campaign job in progress`,
  );
});

emailCampaignWorker.on("error", (err) => {
  console.log(
    `${new Date.toLocaleString()}  Email campaign worker error`,
    err,
  );
});
