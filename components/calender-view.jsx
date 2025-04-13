"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startOfDay, addHours, addMinutes } from "date-fns";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Sidebar } from "./sidebar";
import { EventModal } from "./event-modal";
import { fetchEvents } from "@/redux/slices/eventsSlice";
import { fetchGoals } from "@/redux/slices/goalsSlice";
import { CalendarGrid } from "./calender-grid";
import { CalendarHeader } from "./calender-header";

export default function CalendarView() {
  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { events } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleDateChange = (date) => {
    setCurrentDate(date);
  };

  const handleSlotClick = (date, hour, minute = 0, taskData = null) => {
    console.log("handleSlotClick called with:", {
      date,
      hour,
      minute,
      taskData,
    });

    try {
      // Ensure date is properly formatted
      const dateObj = date instanceof Date ? date : new Date(date);

      // Calculate start and end times
      const startTime = addMinutes(addHours(startOfDay(dateObj), hour), minute);
      const endTime = addHours(startTime, 1);

      console.log("Calculated times:", {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      // Create the basic slot data
      const slotData = {
        date: dateObj,
        startTime,
        endTime,
      };

      // Add task data if provided
      if (taskData && typeof taskData === "object") {
        console.log("Adding task data to slot:", taskData);

        if (taskData.title) {
          slotData.title = taskData.title;
          console.log("Set title to:", taskData.title);
        }

        if (taskData.goalColor) {
          slotData.goalColor = taskData.goalColor;
          console.log("Set goalColor to:", taskData.goalColor);
        }
      }

      console.log("Final selectedSlot data:", slotData);
      setSelectedSlot(slotData);
      setSelectedEvent(null);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error in handleSlotClick:", error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
    setSelectedEvent(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <CalendarHeader
            currentDate={currentDate}
            onDateChange={handleDateChange}
          />
          <CalendarGrid
            currentDate={currentDate}
            events={events}
            onSlotClick={handleSlotClick}
            onEventClick={handleEventClick}
          />
        </div>
      </div>
      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedSlot={selectedSlot}
        selectedEvent={selectedEvent}
      />
    </DndProvider>
  );
}
