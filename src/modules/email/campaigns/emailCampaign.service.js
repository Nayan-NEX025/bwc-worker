import Coach from "../../../models/coaches/coach.model.js";
import User from "../../../models/users/user.model.js";
import ApiError from "../../../utils/error/ApiError.js";
import Email from "../email.model.js";
import EmailCampaign from "./emailCampaign.model.js";
import { emailQueue } from "../../../queues/email/email.queue.js";

const RECIPIENT_RESOLVERS = {
  users: () =>
    User.find({
      status: "active",
      subscriptionStatus: "active",
    })
      .select("auth fullName")
      .populate("auth", "email"),

  coaches: () =>
    Coach.find({
      status: "active",
      subscriptionStatus: "active",
    })
      .select("auth fullName")
      .populate("auth", "email"),
};

export const createEmailCampaign = async (payload, user) => {
  const {
    name,
    recipientsType,
    subject,
    content, // can also pass template name
    module = "marketing",
    scheduledAt,
  } = payload;

  if (!Array.isArray(recipientsType) || recipientsType.length === 0) {
    throw new ApiError("recipientsType must be a non-empty array", 400);
  }

  const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();

  // 1️⃣ Create campaign
  const emailCampaign = await EmailCampaign.create({
    name,
    subject,
    content,
    module,
    recipientsType,
    createdBy: user._id,
    scheduledAt: isScheduled ? new Date(scheduledAt) : undefined,
    status: scheduledAt ? "scheduled" : "queued",
  });

  // 2️⃣ Resolve recipients dynamically
  const recipientResults = await Promise.all(
    recipientsType.map(async (type) => {
      const resolver = RECIPIENT_RESOLVERS[type];
      if (!resolver) {
        throw new ApiError(`Invalid recipients type: ${type}`, 400);
      }

      const data = await resolver();
      return data;
    }),
  );

  const recipients = [
    {
      _id: "694522948bcf7e717784f3ca",
      auth: {
        _id: "694522948bcf7e717784f3c8",
        email: "nayan@nexzem.com",
      },
      fullName: "Shubham Negi",
    },
    // {
    //   _id: "694522948bcf7e717784f3cb",
    //   auth: {
    //     _id: "694522948bcf7e717784f3c9",
    //     email: "nayan@nexzem.com", // duplicate email
    //   },
    //   fullName: "Shubham Negi",
    // },
    // {
    //   _id: "694522948bcf7e717784f3cb",
    //   auth: {
    //     _id: "694522948bcf7e717784f3c9",
    //     email: "nayan@nexzem.com", // duplicate email
    //   },
    //   fullName: "Shubham Negi",
    // },
    // {
    //   _id: "694522948bcf7e717784f3cb",
    //   auth: {
    //     _id: "694522948bcf7e717784f3c9",
    //     email: "nayan@nexzem.com", // duplicate email
    //   },
    //   fullName: "Shubham Negi",
    // },
    // {
    //   _id: "694522948bcf7e717784f3cb",
    //   auth: {
    //     _id: "694522948bcf7e717784f3c9",
    //     email: "nayan@nexzem.com", // duplicate email
    //   },
    //   fullName: "Shubham Negi",
    // },
  ];

  // 3️⃣ Flatten & deduplicate by email
  // const recipients = recipientResults.flat().reduce((acc, curr) => {
  //   acc.set(curr.auth.email, curr);
  //   return acc;
  // }, new Map());

  if (recipients.size === 0) {
    throw new ApiError("No active recipients found", 400);
  }

  // 4️⃣ Create Email docs + enqueue jobs
  //BullMQ will automatically release jobs at the scheduled time.
  const delay = scheduledAt
    ? Math.max(new Date(scheduledAt) - Date.now(), 0)
    : 0;

  for (const recipient of recipients.values()) {
    const email = await Email.create({
      to: recipient?.auth?.email,
      subject,
      module,
      campaign: emailCampaign._id,
      meta: {
        name: recipient.fullName,
      },
      status: scheduledAt ? "scheduled" : "queued",
    });

    await emailQueue.add(
      "send-email",
      {
        emailId: email._id,
      },
      {
        jobId: email._id.toString(),
        delay,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
      },
    );
  }
  // 5️⃣ Update campaign stats
  emailCampaign.totalRecipients = recipients?.size || recipients?.length;
  if (!scheduledAt) {
    emailCampaign.startedAt = new Date();
  }
  await emailCampaign.save();

  return emailCampaign;
};
