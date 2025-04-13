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
      goalColor: eventData.goalColor || "", // Preserve goal color
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