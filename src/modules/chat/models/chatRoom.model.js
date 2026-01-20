import mongoose, { Schema } from "mongoose";
import {
  CHATROOM_ROLE_VALUES,
  CHATROOM_TYPE_VALUES,
} from "../constants/enums/index.js";

const chatRoomSchema = new Schema(
  {
    name: {
      type: String,
      required: function () {
        return this.type === "group";
      },
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: CHATROOM_TYPE_VALUES, // user_support, coach_user, coach_admin, etc.
      default: "direct",
      required: true,
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: CHATROOM_ROLE_VALUES, //
          required: true,
        },
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    admin: { type: String }, // Group owner
    createdBy: { type: String }, // User ID of the initial creator
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;
