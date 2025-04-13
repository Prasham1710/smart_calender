import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import Goal from "@/models/Goal"

export async function GET() {
  try {
    console.log("GET /api/goals: Connecting to database...")
    await connectToDatabase()
    console.log("GET /api/goals: Database connected, fetching goals...")
    const goals = await Goal.find({})
    console.log(`GET /api/goals: Found ${goals.length} goals`)

    return NextResponse.json(goals)
  } catch (error) {
    console.error("GET /api/goals ERROR:", error.message)
    return NextResponse.json({ error: "Failed to fetch goals", details: error.message }, { status: 500 })
  }
}
