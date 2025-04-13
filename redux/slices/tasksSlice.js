import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async (goalId) => {
  try {
    console.log("fetchTasks: Fetching tasks for goalId", goalId)
    const response = await fetch(`/api/tasks?goalId=${goalId}`)
    
    if (!response.ok) {
      console.error("fetchTasks: Failed to fetch tasks", response.status, response.statusText)
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log("fetchTasks: Success, got", data.length, "tasks")
    return data
  } catch (error) {
    console.error("fetchTasks: Error", error.message)
    throw error
  }
})

const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.tasks = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || null
      })
  },
})

export default tasksSlice.reducer
