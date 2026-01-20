import { emailQueue } from "../../queues/email/email.queue.js";
import Email from "./email.model.js";

export const enqueueEmail = async ({
  to,
  subject,
  module,
  meta = {},
  template,
}) => {
  // 1️⃣ Create DB log
  const email = await Email.create({
    to,
    subject,
    module,
    meta,
    status: "queued",
  });
  // 2️⃣ Push job
  await emailQueue.add(
    "send-email",
    {
      to,
      subject,
      module,
      meta,
      html: template,
      emailId: email._id,
    },
    {
      jobId: email._id.toString(), // prevent duplicates jobs in queue
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false, // keep failed jobs
    },
  );

  return email;
};
