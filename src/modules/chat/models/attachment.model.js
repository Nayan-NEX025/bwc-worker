import mongoose, { Schema } from "mongoose";
import { ATTACHMENT_TYPE_VALUES } from "../constants/enums/index.js";

const attachmentSchema = new Schema(
  {
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      index: true,
    },

    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ATTACHMENT_TYPE_VALUES,
      required: true,
    },
    attachment: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    size: {
      type: Number, // size in bytes
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const Attachment = mongoose.model("Attachment", attachmentSchema);

export default Attachment;
