import mongoose from "mongoose"

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["exercise", "eating", "work", "relax", "family", "social"],
      default: "work",
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    goalColor: {
      type: String,
      default: "",
    },
    eventType: {
      type: String,
      enum: ["task", "event"],
      default: "event",
    },
    relatedId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Event || mongoose.model("Event", EventSchema)
