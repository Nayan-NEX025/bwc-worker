import mongoose, { Schema } from "mongoose";

const authProviderSchema = new Schema(
  {
    auth: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["google"], // Extendable for other providers
      required: true,
      index: true,
    },

    providerUserId: {
      type: String,
      required: true,
      index: true,
    },

    email: {
      type: String,
      lowercase: true,
    },

    avatar: String,

    // metadata: {
    //   type: Schema.Types.Mixed, // provider-specific data
    // },
  },
  { timestamps: true }
);

// 🔐 Prevent duplicate provider accounts
authProviderSchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

const AuthProvider = mongoose.model("AuthProvider", authProviderSchema);
export default AuthProvider;
