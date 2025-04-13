import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import Event from "@/models/Event"

export async function PUT(request, { params }) {
  try {
    await connectToDatabase()
    const eventData = await request.json()
    const { id } = params

    console.log("Received update request for event:", id)
    console.log("Event data:", JSON.stringify(eventData))

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    const event = await Event.findById(id)
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Ensure required fields are present
    if (!eventData.title) {
      console.error("Missing title in event update data")
      return NextResponse.json({ error: "Event title is required" }, { status: 400 })
    }

    // Log the critical fields to make sure they're present
    console.log("Title before update:", event.title)
    console.log("New title in update:", eventData.title)
    console.log("Color before update:", event.goalColor)
    console.log("New color in update:", eventData.goalColor)

    // Create a cleaned update object with all required fields
    const cleanedUpdate = {
      title: eventData.title,
      category: eventData.category || event.category || "work", // Use existing if not provided
      date: eventData.date ? new Date(eventData.date) : event.date,
      startTime: eventData.startTime ? new Date(eventData.startTime) : event.startTime,
      endTime: eventData.endTime ? new Date(eventData.endTime) : event.endTime,
      goalColor: eventData.goalColor !== undefined ? eventData.goalColor : event.goalColor, // Preserve empty string
    };

    console.log("Cleaned update data:", cleanedUpdate);

    // Update with the cleaned data
    const updatedEvent = await Event.findByIdAndUpdate(id, cleanedUpdate, { new: true })
    console.log("Updated event:", updatedEvent)

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Failed to update event:", error)
    return NextResponse.json({ error: "Failed to update event", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase()
    const { id } = params

    await Event.findByIdAndDelete(id)

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
