import { notifyUser } from "../../services/notification.service.js";

export const testNotification = async (req, res) => {
  await notifyUser({
    userId: "123",
    event: "ENQUITY_SUBMITTED",
    metadata: {
      coachId: "c1",
    },
  });

  res.json({ success: true, message: "Test notification sent" });
};
