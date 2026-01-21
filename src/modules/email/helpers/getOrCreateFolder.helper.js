import { brevoClient } from "../../../libs/brevo.client.js";
import ApiError from "../../../utils/error/ApiError.js";
import BrevoFolder from "../campaigns/brevoFolder.model.js";

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
