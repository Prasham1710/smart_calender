import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import Event from "@/models/Event"

export async function GET() {
  try {
    await connectToDatabase()
    const events = await Event.find({})

    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectToDatabase()
    const eventData = await request.json()
    
    console.log("[API] Received event data:", eventData)
    
    // Validate the required fields
    if (!eventData.title) {
      console.error("[API] Missing title in event data")
      return NextResponse.json({ error: "Event title is required" }, { status: 400 })
    }
    
    // Parse and validate dates
    let cleanedData = { 
      ...eventData,
      // Ensure these fields exist with defaults if missing
      title: eventData.title,
      category: eventData.category || "work",
      goalColor: eventData.goalColor !== undefined ? eventData.goalColor : "",
      eventType: eventData.eventType || "event",
      relatedId: eventData.relatedId || ""
    };
    
    // Handle date field
    try {
      if (!eventData.date) {
        console.error("[API] Missing date in event data")
        return NextResponse.json({ error: "Event date is required" }, { status: 400 })
      }
      
      // Ensure date is in proper format
      cleanedData.date = new Date(eventData.date);
      if (isNaN(cleanedData.date.getTime())) {
        console.error("[API] Invalid date format:", eventData.date)
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
      }
      
    } catch (error) {
      console.error("[API] Error parsing date:", error)
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }
    
    // Handle startTime field
    try {
      if (!eventData.startTime) {
        console.error("[API] Missing startTime in event data")
        return NextResponse.json({ error: "Event start time is required" }, { status: 400 })
      }
      
      // Ensure startTime is in proper format
      cleanedData.startTime = new Date(eventData.startTime);
      if (isNaN(cleanedData.startTime.getTime())) {
        console.error("[API] Invalid startTime format:", eventData.startTime)
        return NextResponse.json({ error: "Invalid start time format" }, { status: 400 })
      }
      
    } catch (error) {
      console.error("[API] Error parsing startTime:", error)
      return NextResponse.json({ error: "Invalid start time format" }, { status: 400 })
    }
    
    // Handle endTime field
    try {
      if (!eventData.endTime) {
        console.error("[API] Missing endTime in event data")
        return NextResponse.json({ error: "Event end time is required" }, { status: 400 })
      }
      
      // Ensure endTime is in proper format
      cleanedData.endTime = new Date(eventData.endTime);
      if (isNaN(cleanedData.endTime.getTime())) {
        console.error("[API] Invalid endTime format:", eventData.endTime)
        return NextResponse.json({ error: "Invalid end time format" }, { status: 400 })
      }
      
    } catch (error) {
      console.error("[API] Error parsing endTime:", error)
      return NextResponse.json({ error: "Invalid end time format" }, { status: 400 })
    }
    
    console.log("[API] Cleaned event data:", cleanedData)
    
    try {
      const newEvent = new Event(cleanedData)
      await newEvent.save()
      console.log("[API] Event saved successfully:", newEvent)
      return NextResponse.json(newEvent)
    } catch (dbError) {
      console.error("[API] Database error saving event:", dbError)
      return NextResponse.json({ 
        error: "Failed to create event in database",
        details: dbError.message
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error("[API] Error creating event:", error)
    return NextResponse.json({ 
      error: "Failed to create event", 
      details: error.message 
    }, { status: 500 })
  }
}
