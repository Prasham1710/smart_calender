import mongoose from "mongoose"

const GoalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Goal || mongoose.model("Goal", GoalSchema)
