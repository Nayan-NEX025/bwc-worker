import { pushChannel } from "../channels/push.channel.js";
import { NOTIFICATION_EVENTS } from "../events/index.js";

export const notifyUser = async ({ userId, event, metadata = {} }) => {
  console.log("📤 Sending notification to user:", userId, event, metadata);
  const eventConfig = NOTIFICATION_EVENTS[event];

  if (!eventConfig) {
    console.warn("⚠️ Unknown notification event:", event);
    return;
  }

  if (eventConfig.channels.includes("push")) {
    await pushChannel({
      userId,
      title: eventConfig.title,
      message: eventConfig.message,
      data: metadata,
    });
  }
};
