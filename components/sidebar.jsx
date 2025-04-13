"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/dnd-types";
import { fetchTasks } from "@/redux/slices/tasksSlice";
import { fetchGoals } from "@/redux/slices/goalsSlice";

export function Sidebar() {
  const dispatch = useDispatch();
  const {
    goals,
    status: goalsStatus,
    error: goalsError,
  } = useSelector((state) => state.goals);
  const {
    tasks,
    status: tasksStatus,
    error: tasksError,
  } = useSelector((state) => state.tasks);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [seedStatus, setSeedStatus] = useState("idle");

  console.log("Goals from Redux:", goals);
  console.log("Goals status:", goalsStatus);
  console.log("Goals error:", goalsError);
  console.log("Tasks from Redux:", tasks);
  console.log("Tasks status:", tasksStatus);
  console.log("Tasks error:", tasksError);

  useEffect(() => {
    console.log("Dispatching fetchGoals from Sidebar");
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleGoalClick = (goalId) => {
    console.log("Goal clicked:", goalId);
    setSelectedGoal(goalId);
    dispatch(fetchTasks(goalId));
  };

  const handleSeedData = async () => {
    try {
      setSeedStatus("loading");
      const response = await fetch("/api/seed");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Seed response:", data);
      setSeedStatus("succeeded");

      dispatch(fetchGoals());

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Seed error:", error);
      setSeedStatus("failed");
    }
  };

  return (
    <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Goals</h2>

      {goalsStatus === "loading" && (
        <div className="p-2 text-blue-500">Loading goals...</div>
      )}

      {goalsStatus === "failed" && (
        <div className="p-2 text-red-500">
          Failed to load goals: {goalsError}
          <button
            className="block mt-2 text-sm bg-blue-500 text-white px-2 py-1 rounded"
            onClick={() => dispatch(fetchGoals())}
          >
            Retry
          </button>
        </div>
      )}

      {goalsStatus === "succeeded" && goals.length === 0 && (
        <div className="p-2 bg-gray-100 rounded mb-4">
          <div className="text-gray-700 mb-2">
            No goals found. Create sample data:
          </div>
          <button
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
            onClick={handleSeedData}
            disabled={seedStatus === "loading"}
          >
            {seedStatus === "loading"
              ? "Creating data..."
              : seedStatus === "succeeded"
              ? "Data created! Refresh page"
              : "Create Sample Data"}
          </button>
          {seedStatus === "failed" && (
            <div className="text-red-500 text-sm mt-2">
              Failed to create data. Check console for errors.
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 mb-6">
        {goals.map((goal) => (
          <GoalItem
            key={goal._id}
            goal={goal}
            isSelected={selectedGoal === goal._id}
            onClick={() => handleGoalClick(goal._id)}
          />
        ))}
      </div>

      {selectedGoal && (
        <>
          <h2 className="text-lg font-semibold mb-4">Tasks</h2>

          {tasksStatus === "loading" && (
            <div className="p-2 text-blue-500">Loading tasks...</div>
          )}

          {tasksStatus === "failed" && (
            <div className="p-2 text-red-500">
              Failed to load tasks: {tasksError}
              <button
                className="block mt-2 text-sm bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() => dispatch(fetchTasks(selectedGoal))}
              >
                Retry
              </button>
            </div>
          )}

          {tasksStatus === "succeeded" && tasks.length === 0 && (
            <div className="p-2 text-gray-500">
              No tasks found for this goal.
            </div>
          )}

          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                goalColor={
                  goals.find((g) => g._id === task.goalId)?.color || "#000000"
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Update GoalItem component to remove drag functionality
function GoalItem({ goal, isSelected, onClick }) {
  return (
    <div
      className={`p-2 rounded-md cursor-pointer ${
        isSelected ? "bg-gray-200" : "hover:bg-gray-100"
      }`}
      style={{
        borderLeft: `4px solid ${goal.color}`,
      }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span>{goal.name}</span>
      </div>
    </div>
  );
}

function TaskItem({ task, goalColor }) {
  console.log("Rendering TaskItem:", { taskName: task.name, color: goalColor });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TASK,
    item: () => {
      console.log("Starting drag for task:", task.name);
      return {
        id: task._id,
        name: task.name,
        goalColor,
        goalId: task.goalId,
        type: "task",
      };
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      console.log("Drag ended for task:", task.name);
      console.log("Drop result:", dropResult);
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="p-2 rounded-md cursor-move bg-white border"
      style={{
        borderLeft: `4px solid ${goalColor}`,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {task.name}
    </div>
  );
}
