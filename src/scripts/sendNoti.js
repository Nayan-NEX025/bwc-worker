import "dotenv/config";
import { notifyUser } from "../modules/notifications/services/notification.service.js";

async function testPush() {
  console.log("🚀 Testing push notification...");

  await notifyUser({
    userId: "123", // MUST match frontend subscription: user_123
    title: "Coach Approved 🎉",
    message: "Your coach has approved your request",
    metadata: {
      type: "COACH_APPROVED",
    },
  });

  console.log("✅ Test finished");
  process.exit(0);
}

testPush().catch((err) => {
  console.error(err);
  process.exit(1);
});
