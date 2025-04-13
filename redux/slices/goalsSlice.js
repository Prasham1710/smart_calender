import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchGoals = createAsyncThunk("goals/fetchGoals", async () => {
  try {
    console.log("fetchGoals: Fetching goals from API")
    const response = await fetch("/api/goals")
    
    if (!response.ok) {
      console.error("fetchGoals: Failed to fetch goals", response.status, response.statusText)
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log("fetchGoals: Success, got", data.length, "goals")
    return data
  } catch (error) {
    console.error("fetchGoals: Error", error.message)
    throw error
  }
})

const goalsSlice = createSlice({
  name: "goals",
  initialState: {
    goals: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.goals = action.payload
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || null
      })
  },
})

export default goalsSlice.reducer
