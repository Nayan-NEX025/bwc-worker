import mongoose from "mongoose";

const sectionExerciseSetSchema = new mongoose.Schema(
  {
    sectionExerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SectionExercise",
      required: true,
    },

    sets: [
      {
        setNumber: Number,
        weight: Number,
        reps: Number,
        rest: String,
        eachSide: Boolean,
        tempo: String
      }
    ],
    
    tempo: {
      type: String, // Example: "3-1-2-0"
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("SectionExerciseSet", sectionExerciseSetSchema);
