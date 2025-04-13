import mongoose from "mongoose"

const TaskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    goalId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Task || mongoose.model("Task", TaskSchema)
