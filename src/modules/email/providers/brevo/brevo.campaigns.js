import { brevoClient } from "../../../../libs/brevo.client.js";

// Send an email campaign immediately, based on campaignId
export const sendBrevoCampaign = async (campaignId) => {
  try {
    await brevoClient.post(`/emailCampaigns/${campaignId}/sendNow`);
    console.log("sending brevo campaign....");
  } catch (err) {
    console.log(err);
    throw err.response?.data || err;
  }
};
