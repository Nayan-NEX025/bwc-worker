import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    exerciseName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    targetMuscle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Muscle",
      required: true,
    },

    targetExerciseType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExerciseType",
      required: true,
    },

    targetEquipments: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },

    targetMachine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      required: true,
    },

    targetForce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForceType",
      required: true,
    },

    targetExperienceLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExperienceLevel",
      required: true,
    },

    videoUrl: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },

    overview: {
      type: String,
      required: true,
      trim: true,
    },

    tips: {
      type: String,
      required: true,
      trim: true,
    },

    instruction: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "creatorModel",
      required: true,
    },
    creatorModel: {
      type: String,
      required: true,
      enum: ["Auth", "Coach"],
    },
  },
  { timestamps: true }
);

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;
