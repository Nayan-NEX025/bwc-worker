import mongoose from "mongoose";

const ExerciseItemSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exercise",
    required: true,
  },

  sets: { type: Number, default: 0 },
  reps: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  restTime: { type: Number, default: 0 },

  notes: {
    type: String,
    required: false,
    trim: true,
  },
});

const SectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  exercises: [ExerciseItemSchema],

  // order: {
  //   type: Number,
  //   required: true, // for arranging sections
  // },
});

const WorkoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    workoutImage: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },

    sections: [SectionSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Workout", WorkoutSchema);
