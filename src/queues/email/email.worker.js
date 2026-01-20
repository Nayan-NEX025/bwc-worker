import { Worker } from "bullmq";
import redis from "../../configs/redis.js";
import Email from "../../modules/email/email.model.js";
import EmailCampaign from "../../modules/email/campaigns/emailCampaign.model.js";
import dbConnect from "../../configs/db.config.js";
import { sendEmail } from "../../modules/email/email.service.js";
dbConnect(); // BullMQ workers are separate Node processes. Every worker must initialize its own DB, Redis, and env. They are independent services, not threads.
console.log("worker is running.");

new Worker(
  "email-queue",
  async (job) => {
    const { to, subject, module, meta, html, emailId } = job.data;

    const email = await Email.findById(emailId).populate({
      path: "campaign",
      model: EmailCampaign,
    });

    if (!email) return;

    // Prevent double send
    if (["sent", "delivered"].includes(email.status)) {
      return;
    }

    try {
      // 🟢 ONLY for campaign emails
      if (email.campaign) {
        // 🔑 1️⃣ Mark campaign as sending ONCE
        await EmailCampaign.updateOne(
          {
            _id: email.campaign._id,
            status: { $in: ["scheduled", "queued"] },
          },
          {
            status: "sending",
            startedAt: new Date(),
          },
        );
      }

      // 2️⃣ Mark processing BEFORE sending
      email.status = "processing";
      await email.save();
      // 3️⃣ Send email
      const data = await sendEmail({
        to: email.to,
        subject: subject || email.subject,
        template: html || "campaign",
        payload: meta || {
          title: email.campaign.subject,
          content: email.campaign.content, // 👈 from DB
          ...email.meta,
        },
      });
      // 4️⃣ Mark sent
      email.status = "sent";
      email.sentAt = new Date();
      email.resendId = data?.id;
      await email.save();
      console.log("Email is sent..");
    } catch (err) {
      email.status = "failed";
      email.failedAt = new Date();
      email.error = err.message;
      await email.save();
      throw err; // BullMQ retry
    }
  },
  {
    connection: redis,
    concurrency: 1,
    limiter: {
      max: 1, // max 1 job at a time based on concurrency
      duration: 1000,
    },
  },
);
