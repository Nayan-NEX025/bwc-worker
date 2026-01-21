import mongoose from "mongoose";

const brevoFolderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brevoFolderId: {
      type: Number,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const BrevoFolder = mongoose.model("BrevoFolder", brevoFolderSchema);

export default BrevoFolder;
