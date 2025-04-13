import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchEvents = createAsyncThunk("events/fetchEvents", async () => {
  const response = await fetch("/api/events")
  const data = await response.json()
  return data
})

export const createEvent = createAsyncThunk("events/createEvent", async (eventData) => {
  try {
    console.log("Creating event with data:", eventData);
    
    // Ensure required fields are present
    if (!eventData.title) {
      console.error("Missing title in event data");
      throw new Error("Event title is required");
    }
    
    // Ensure all date objects are valid before converting
    let date = eventData.date;
    let startTime = eventData.startTime;
    let endTime = eventData.endTime;
    
    // Make sure these are all valid Date objects
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date object:", date);
      date = new Date();
    }
    
    if (!(startTime instanceof Date) || isNaN(startTime.getTime())) {
      console.error("Invalid startTime object:", startTime);
      startTime = new Date();
    }
    
    if (!(endTime instanceof Date) || isNaN(endTime.getTime())) {
      console.error("Invalid endTime object:", endTime);
      endTime = new Date(startTime.getTime() + 60*60*1000); // Default to 1 hour after start
    }
    
    // Create the formatted data with validated dates and required fields
    const formattedData = {
      ...eventData,
      title: eventData.title,
      category: eventData.category || "work", // Default to work category if not provided
      goalColor: eventData.goalColor || "", // Ensure goalColor exists (even if empty)
      eventType: eventData.eventType || "event", // Default to regular event if not specified
      relatedId: eventData.relatedId || "", // Include relatedId if available
      date: date.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };
    
    console.log("Formatted event data:", formattedData);
    
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error response:", errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Event created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in createEvent thunk:", error);
    throw error;
  }
})

export const updateEvent = createAsyncThunk("events/updateEvent", async (eventData) => {
  try {
    console.log("Updating event with data:", eventData);
    
    // Ensure all required fields are present
    if (!eventData.title) {
      console.error("Missing title in event update data");
      throw new Error("Event title is required");
    }
    
    // Ensure all date objects are valid before converting
    let date = eventData.date;
    let startTime = eventData.startTime;
    let endTime = eventData.endTime;
    
    // Make sure these are all valid Date objects
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date object:", date);
      date = new Date();
    }
    
    if (!(startTime instanceof Date) || isNaN(startTime.getTime())) {
      console.error("Invalid startTime object:", startTime);
      startTime = new Date();
    }
    
    if (!(endTime instanceof Date) || isNaN(endTime.getTime())) {
      console.error("Invalid endTime object:", endTime);
      endTime = new Date(startTime.getTime() + 60*60*1000); // Default to 1 hour after start
    }
    
    // Create the formatted data with validated dates
    const formattedData = {
      ...eventData,
      title: eventData.title, // Explicitly include title
      category: eventData.category || "work", // Default to work if missing
      goalColor: eventData.goalColor !== undefined ? eventData.goalColor : "", // Preserve goal color including empty string
      eventType: eventData.eventType || "event", // Default to regular event if not specified
      relatedId: eventData.relatedId || "", // Include relatedId if available
      date: date.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };
    
    console.log("Formatted event update data:", formattedData);
    
    const response = await fetch(`/api/events/${eventData._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Event updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in updateEvent thunk:", error);
    throw error;
  }
})

export const deleteEvent = createAsyncThunk("events/deleteEvent", async (eventId) => {
  await fetch(`/api/events/${eventId}`, {
    method: "DELETE",
  })
  return eventId
})

const eventsSlice = createSlice({
  name: "events",
  initialState: {
    events: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = "succeeded"
        
        // Ensure all events have required properties
        state.events = action.payload.map(event => {
          // Determine the appropriate eventType
          let eventType = event.eventType || "event";
          if (eventType !== "task" && eventType !== "event") {
            eventType = "event"; // Default to 'event' if it's not a valid type
          }
          
          return {
            ...event,
            title: event.title || "Untitled Event",
            category: event.category || "work",
            goalColor: event.goalColor !== undefined ? event.goalColor : "",
            eventType: eventType,
            relatedId: event.relatedId || ""
          };
        });
        
        console.log("Fetched and processed events:", state.events.length);
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || null
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        console.log("Create event fulfilled with payload:", action.payload);
        state.events.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        console.error("Create event rejected with error:", action.error);
        state.error = action.error.message || "Failed to create event";
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex((event) => event._id === action.payload._id)
        if (index !== -1) {
          state.events[index] = action.payload
        }
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter((event) => event._id !== action.payload)
      })
  },
})

export default eventsSlice.reducer
