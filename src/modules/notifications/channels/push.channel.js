import { sendPush } from "../services/push.service.js";

export const pushChannel = async (payload) => {
  return sendPush(payload);
};
