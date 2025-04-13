import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import Goal from "@/models/Goal"
import Task from "@/models/Task"

export async function GET() {
  try {
    console.log("Connecting to database for seeding...")
    await connectToDatabase()
    
    // Clear existing data
    await Goal.deleteMany({})
    await Task.deleteMany({})
    
    console.log("Creating sample goals...")
    
    // Create sample goals
    const goals = await Goal.insertMany([
      { name: "Learn", color: "#4285F4" },
      { name: "Health", color: "#34A853" },
      { name: "Work", color: "#FBBC05" },
      { name: "Social", color: "#EA4335" }
    ])
    
    console.log(`Created ${goals.length} goals`)
    
    // Create sample tasks for each goal
    const learnGoal = goals.find(g => g.name === "Learn")
    const healthGoal = goals.find(g => g.name === "Health")
    const workGoal = goals.find(g => g.name === "Work")
    const socialGoal = goals.find(g => g.name === "Social")
    
    console.log("Creating sample tasks...")
    
    const tasks = await Task.insertMany([
      { name: "AI based agents", goalId: learnGoal._id },
      { name: "MLE", goalId: learnGoal._id },
      { name: "DE related", goalId: learnGoal._id },
      { name: "Basics", goalId: learnGoal._id },
      
      { name: "Gym", goalId: healthGoal._id },
      { name: "Yoga", goalId: healthGoal._id },
      { name: "Diet", goalId: healthGoal._id },
      
      { name: "Client meeting", goalId: workGoal._id },
      { name: "Documentation", goalId: workGoal._id },
      { name: "Coding", goalId: workGoal._id },
      
      { name: "Call friends", goalId: socialGoal._id },
      { name: "Family dinner", goalId: socialGoal._id }
    ])
    
    console.log(`Created ${tasks.length} tasks`)
    
    return NextResponse.json({ 
      success: true, 
      message: "Database seeded successfully",
      data: {
        goals: goals.length,
        tasks: tasks.length
      }
    })
    
  } catch (error) {
    console.error("Seed ERROR:", error)
    return NextResponse.json({ 
      error: "Failed to seed database", 
      details: error.message 
    }, { status: 500 })
  }
} 