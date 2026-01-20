import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // enum of notification types
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Object, default: {} },
    channels: { type: [String], default: [] },
    isRead: { type: Boolean, default: false },
    status: {
      type: "string",
      enum: ["pending", "queued", "processing", "sent", "failed", "read"],
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
