import Coach from "../../../models/coaches/coach.model.js";
import User from "../../../models/users/user.model.js";
import ApiError from "../../../utils/error/ApiError.js";
import Email from "../email.model.js";
import EmailCampaign from "./emailCampaign.model.js";
import { emailQueue } from "../../../queues/email/email.queue.js";
import { brevoClient } from "../../../libs/brevo.client.js";
import { getOrCreateFolder } from "../helpers/getOrCreateFolder.helper.js";
import { emailCampaignQueue } from "../../../queues/email-campaign/emailCampaign.queue.js";

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

export const createBrevoEmailCampaign = async (payload, user) => {
  const {
    name,
    recipientsType,
    subject,
    content,
    module = "marketing",
    scheduledAt,
  } = payload;

  // 0️⃣ Validate schedule
  if (scheduledAt && new Date(scheduledAt) <= new Date()) {
    throw new ApiError("scheduledAt must be a future date", 400);
  }

  const isScheduled = Boolean(scheduledAt);

  // 1️⃣ Create DB campaign (SOURCE OF TRUTH)
  const campaign = await EmailCampaign.create({
    name,
    subject,
    content,
    module,
    recipientsType,
    createdBy: user._id,
    scheduledAt: isScheduled ? new Date(scheduledAt) : null,
    status: isScheduled ? "scheduled" : "processing",
  });

  // // 2️⃣ Resolve recipients
  // const recipientResults = await Promise.all(
  //   recipientsType.map((type) => {
  //     const resolver = RECIPIENT_RESOLVERS[type];
  //     if (!resolver) {
  //       throw new ApiError(400, `Invalid recipients type: ${type}`);
  //     }
  //     return resolver();
  //   }),
  // );

  // const recipients = Array.from(
  //   new Map(recipientResults.flat().map((r) => [r.auth.email, r])).values(),
  // );

  // if (!recipients.length) {
  //   throw new ApiError(400, "No active recipients found");
  // }

  const recipients = [
    {
      _id: "694522948bcf7e717784f3ca",
      auth: {
        _id: "694522948bcf7e717784f3c8",
        email: "troifadautecrou-4200@yopmail.com",
      },
      fullName: "Shubham Negi",
    },
    {
      _id: "694522948bcf7e717784f3ca",
      auth: {
        _id: "694522948bcf7e717784f3c8",
        email: "genag67505@elafans.com",
      },
      fullName: "Shubham Negi",
    },
  ];
  // 3️⃣ Ensure folder + create list (PER CAMPAIGN)
  const folderId = await getOrCreateFolder(module);

  const listId = await createBrevoList({
    folderId, // Id of the parent folder in which this list is to be created
    name: `Campaign - ${campaign._id}`, // name of the list
  });

  // 4️⃣ Upsert contacts (idempotent)
  await Promise.all(
    recipients.map((r) =>
      upsertBrevoContact({
        email: r.auth.email,
        attributes: { FULLNAME: r.fullName },
        listIds: [listId],
      }),
    ),
  );

  // 5️⃣ Create Brevo campaign (DRAFT)
  const brevoCampaignId = await createBrevoCampaign({
    name,
    subject,
    htmlContent: content,
    sender: {
      name: "Breezway",
      email: "nayan@nexzem.com",
    },
    listIds: [listId], // ✅ CORRECT LIST
  });

  campaign.brevoCampaignId = brevoCampaignId;
  campaign.brevoListId = listId;
  campaign.totalRecipients = recipients.length;

  // 6️⃣ Send now OR schedule
  if (isScheduled) {
    const delay = Math.max(new Date(scheduledAt).getTime() - Date.now(), 0);

    await emailCampaignQueue.add(
      "send-campaign",
      { campaignId: campaign._id },
      {
        jobId: campaign._id.toString(), // idempotency
        delay,
        attempts: 3,
        backoff: { type: "exponential", delay: 10000 },
        removeOnComplete: true,
      },
    );
  } else {
    //immediate campaign
    campaign.startedAt = new Date();
    await sendBrevoCampaign(brevoCampaignId);
    campaign.completedAt = new Date(); // When Brevo accepted the send, completedAt= successfully handed this campaign to Brevo.
    campaign.status = "sent";
  }

  await campaign.save();
  return campaign;
};

export const upsertBrevoContact = async ({
  email,
  attributes = {},
  listIds = [],
}) => {
  try {
    const response = await brevoClient.post("/contacts", {
      email,
      attributes,
      listIds,
      updateEnabled: true,
    });
    console.log("upser res: ", response.data);
    console.log("inside brevo contact...............");
  } catch (err) {
    console.log(err);
    throw err.response?.data || err;
  }
};

export const sendBrevoCampaign = async (campaignId) => {
  try {
    await brevoClient.post(`/emailCampaigns/${campaignId}/sendNow`);
    console.log("sending brevo campaign....");
  } catch (err) {
    console.log(err);
    throw err.response?.data || err;
  }
};

export const createBrevoCampaign = async ({
  name,
  subject,
  htmlContent,
  sender,
  listIds,
}) => {
  const res = await brevoClient.post("/emailCampaigns", {
    name,
    subject,
    htmlContent,
    sender, // { name, email }
    recipients: {
      listIds,
    },
    type: "classic",
  });
  console.log("creating brevo campaign...");

  return res.data.id; // brevoCampaignId
};

export const createBrevoList = async ({ folderId, name }) => {
  try {
    const res = await brevoClient.post("/contacts/lists", {
      folderId,
      name,
    });
    return res.data.id;
  } catch (error) {
    console.log("catch::", error.response?.data.message); // error.response?.data = { code: 'invalid_parameter', message: 'Invalid folder id' }
    throw new ApiError("Failed to create Brevo list", 500);
  }
};
