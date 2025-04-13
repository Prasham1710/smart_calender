import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import Task from "@/models/Task"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get("goalId")

    await connectToDatabase()

    const query = goalId ? { goalId } : {}
    const tasks = await Task.find(query)

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}
