import { emailCampaignQueue } from "../../../queues/email-campaign/emailCampaign.queue.js";

export const scheduleCampaignSend = async ({ campaignId, runAt }) => {
  const delay = Math.max(new Date(runAt) - Date.now(), 0);

  await emailCampaignQueue.add(
    "send-campaign",
    { campaignId },
    {
      jobId: campaignId.toString(), // idempotent
      delay,
      attempts: 3,
      backoff: { type: "exponential", delay: 10000 },
      removeOnComplete: true,
    },
  );
};
