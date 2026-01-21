import { Queue } from "bullmq";
import redis from "../../configs/redis.js";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

export const emailCampaignQueue = new Queue("email-campaign-queue", {
  connection: redis,
});

export const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(emailCampaignQueue)],
  serverAdapter,
});
