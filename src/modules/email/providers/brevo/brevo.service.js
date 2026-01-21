import { brevoClient } from "../../../../libs/brevo.client.js";
import ApiError from "../../../../utils/error/ApiError.js";
import BrevoFolder from "../../campaigns/brevoFolder.model.js";

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

export const getOrCreateFolder = async (module) => {
  try {
    const existing = await BrevoFolder.findOne({ name: module });
    console.log(existing);
    if (existing) return existing.brevoFolderId;

    const folderId = await createBrevoFolder(module);
    await BrevoFolder.create({ name: module, brevoFolderId: folderId });

    return folderId;
  } catch (error) {
    console.log("catch: ", error);
    throw new ApiError(
      `Failed to get or create Brevo folder for module: ${module}`,
      500,
    );
  }
};

export const createBrevoFolder = async (name) => {
  console.log("creating brevo folder...");
  const res = await brevoClient.post("/contacts/folders", { name });
  return res.data.id;
};

// Prepare the email campaign not send immediately
export const launchBrevoCampaign = async ({ campaign, recipients }) => {
  const folderId = await getOrCreateFolder(campaign.module);

  const listId = await createBrevoList({
    folderId, // Id of the parent folder in which this list is to be created
    name: `Campaign - ${campaign._id}`, // name of the list
  });

  await Promise.all(
    recipients.map((r) =>
      upsertBrevoContact({
        email: r.auth.email,
        attributes: { FULLNAME: r.fullName },
        listIds: [listId],
      }),
    ),
  );

  const brevoCampaignId = await createBrevoCampaign({
    name: campaign.name,
    subject: campaign.subject,
    htmlContent: campaign.content,
    sender: {
      name: "Breezway",
      email: "nayan@nexzem.com",
    },
    listIds: [listId],
  });

  return { brevoCampaignId, listId };
};
