import PushNotifications from "@pusher/push-notifications-server";
import {
  PUSHER_BEAMS_INSTANCE_ID,
  PUSHER_BEAMS_SECRET_KEY,
} from "../../../configs/env.js";

const beamsClient = new PushNotifications({
  instanceId: PUSHER_BEAMS_INSTANCE_ID,
  secretKey: PUSHER_BEAMS_SECRET_KEY,
});

export default beamsClient;
