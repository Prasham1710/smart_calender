"use client";

import { useState } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/dnd-types";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { updateEvent } from "@/redux/slices/eventsSlice";

export function CalendarEvent({ event, style, onClick }) {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);

  // Debug: log the event properties to see what's missing
  console.log("Rendering event:", {
    id: event._id,
    title: event.title,
    category: event.category,
    goalColor: event.goalColor,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
  });

  const getCategoryColor = (category) => {
    // Default colors for each category
    const colors = {
      exercise: "bg-green-500",
      eating: "bg-orange-500",
      work: "bg-blue-500",
      relax: "bg-purple-500",
      family: "bg-pink-500",
      social: "bg-yellow-500",

      // Add defaults for any other categories
      meeting: "bg-indigo-500",
      study: "bg-teal-500",
      travel: "bg-red-500",
      entertainment: "bg-amber-500",
      health: "bg-emerald-500",
      other: "bg-gray-500",
    };

    // If category is undefined or null, default to work
    const effectiveCategory = category || "work";

    // Return the color for the category, or the default gray if not found
    return colors[effectiveCategory] || "bg-gray-500";
  };

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EVENT,
    item: {
      id: event._id,
      type: "event",
      title: event.title,
      category: event.category,
      goalColor: event.goalColor,
      isEventDrag: true,
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult && dropResult.day) {
        try {
          // Create a clone of the day to avoid modifying the original date
          const newDay = new Date(dropResult.day);

          console.log("Dragged event to:", {
            day: newDay,
            hour: dropResult.hour,
          });

          // Make sure we preserve all important fields
          const updatedEvent = {
            ...event,
            title: event.title || "Untitled Event", // Ensure title exists
            category: event.category || "work", // Ensure category exists
            goalColor: event.goalColor || "", // Ensure color is preserved
            date: newDay,
            startTime: new Date(new Date(newDay).setHours(dropResult.hour)),
            endTime: new Date(new Date(newDay).setHours(dropResult.hour + 1)),
          };

          console.log("Directly updating event with preserved fields:", {
            title: updatedEvent.title,
            category: updatedEvent.category,
            goalColor: updatedEvent.goalColor,
          });

          dispatch(updateEvent(updatedEvent));
        } catch (error) {
          console.error("Error updating event during drag:", error);
        }
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const eventColor = event.goalColor || getCategoryColor(event.category);
  const opacity = isDragging ? 0.5 : 1;

  // Decide on the event styling based on whether it has a goal color
  let eventClassName =
    "absolute left-0 right-0 mx-1 rounded-md px-2 py-1 overflow-hidden text-white";

  // Use the goal color when available
  if (event.goalColor) {
    // If the event has a goal color, use it as the background
    eventClassName += ` bg-white border-l-4`;
    style = {
      ...style,
      opacity,
      borderLeftColor: event.goalColor,
      backgroundColor: `${event.goalColor}30`, // Using opacity to make the background lighter
      color: "#000", // Dark text for better contrast on light background
    };
  } else {
    // Otherwise use the category color as background
    eventClassName += ` ${getCategoryColor(event.category)}`;
  }

  return (
    <div ref={drag} className={eventClassName} style={style} onClick={onClick}>
      <div className="flex justify-between items-start">
        <div className="font-medium truncate">{event.title}</div>
        <button
          onClick={toggleExpand}
          className="text-xs bg-white bg-opacity-20 rounded-full h-4 w-4 flex items-center justify-center"
        >
          {isExpanded ? "-" : "+"}
        </button>
      </div>
      {isExpanded && (
        <div className="mt-1 text-xs">
          <div>
            {format(new Date(event.startTime), "h:mm a")} -{" "}
            {format(new Date(event.endTime), "h:mm a")}
          </div>
          <div className="mt-1">
            {event.category}
            {event.goalColor && (
              <span
                className="ml-2 inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: event.goalColor }}
              ></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
