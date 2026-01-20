import { publishPush } from "../providers/push/pusher.provider.js";

export const sendPush = async ({ userId, title, message, data }) => {
  const interests = [`user_${userId}`];

  console.log("📤 Sending push to:", interests);

  await publishPush({
    interests,
    title,
    body: message,
    data,
  });

  console.log("✅ Push sent to:", interests);
};
