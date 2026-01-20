import mongoose from "mongoose";

const sectionExerciseSchema = new mongoose.Schema(
  {
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutSection",
      required: true,
    },

    exerciseInfoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExerciseInfo",
      required: true,
    },

    SectionName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SectionExercise", sectionExerciseSchema);
