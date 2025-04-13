"use client";

import { useRef } from "react";
import {
  format,
  startOfWeek,
  addDays,
  getHours,
  getMinutes,
  isSameDay,
  parseISO,
} from "date-fns";
import { useDrop } from "react-dnd";
import { ItemTypes } from "@/lib/dnd-types";
import { CalendarEvent } from "./calender-event";

export function CalendarGrid({
  currentDate,
  events,
  onSlotClick,
  onEventClick,
}) {
  const gridRef = useRef(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const renderTimeLabels = () => {
    return (
      <div className="w-16 pr-2 text-right">
        {hours.map((hour) => (
          <div
            key={hour}
            className="h-20 border-t flex items-start justify-end"
          >
            <span className="text-xs text-gray-500 -mt-2">
              {hour === 0
                ? "12 AM"
                : hour < 12
                ? `${hour} AM`
                : hour === 12
                ? "12 PM"
                : `${hour - 12} PM`}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderDayColumns = () => {
    return days.map((day) => {
      const dayEvents = events.filter((event) => {
        const eventDate =
          typeof event.date === "string" ? parseISO(event.date) : event.date;
        return isSameDay(eventDate, day);
      });

      console.log(
        `Events for ${format(day, "MM/dd")}: `,
        dayEvents.length,
        dayEvents.map((e) => e.title)
      );

      return (
        <DayColumn
          key={day.toString()}
          day={day}
          events={dayEvents}
          onSlotClick={onSlotClick}
          onEventClick={onEventClick}
        />
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex border-b">
        <div className="w-16"></div>
        {days.map((day) => (
          <div
            key={day.toString()}
            className="flex-1 text-center py-2 font-medium"
          >
            <div>{format(day, "EEE")}</div>
            <div className="text-2xl">{format(day, "d")}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-1 overflow-y-auto" ref={gridRef}>
        {renderTimeLabels()}
        <div className="flex flex-1">{renderDayColumns()}</div>
      </div>
    </div>
  );
}

function DayColumn({ day, events, onSlotClick, onEventClick }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dropRef = useRef(null);

  const [{ isOver }, drop] = useDrop({
    accept: [ItemTypes.EVENT, ItemTypes.TASK],
    drop: (item, monitor) => {
      console.log("Drop detected with item:", item);
      const clientOffset = monitor.getClientOffset();
      if (clientOffset && dropRef.current) {
        const dropTargetRect = dropRef.current.getBoundingClientRect();
        const y = clientOffset.y - dropTargetRect.top;
        const hourHeight = dropTargetRect.height / 24;
        const hour = Math.floor(y / hourHeight);

        if (item.type === "event") {
          console.log("Event item dropped:", item);
          return { day, hour };
        } else if (item.type === "task") {
          console.log("Task item dropped:", item);
          console.log("Task day:", day);
          console.log("Task hour:", hour);

          const taskData = {
            title: item.name,
            goalColor: item.goalColor,
            taskId: item.id,
          };

          console.log("Passing task data to onSlotClick:", taskData);
          onSlotClick(day, hour, 0, taskData);

          return {
            day,
            hour,
            taskName: item.name,
            goalColor: item.goalColor,
            dropComplete: true,
          };
        }
      }
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const setDropRef = (el) => {
    dropRef.current = el;
    drop(el);
  };

  return (
    <div
      ref={setDropRef}
      className={`flex-1 relative ${isOver ? "bg-blue-50" : ""}`}
    >
      {hours.map((hour) => {
        const handleCellClick = (e) => {
          if (!isOver) {
            onSlotClick(day, hour);
          }
        };

        return (
          <div
            key={hour}
            className={`h-20 border-t border-l cursor-pointer ${
              isOver ? "bg-blue-50" : ""
            }`}
            onClick={handleCellClick}
          >
            <div className="h-5 border-b border-dashed border-gray-200"></div>
            <div className="h-5 border-b border-dashed border-gray-200"></div>
            <div className="h-5 border-b border-dashed border-gray-200"></div>
          </div>
        );
      })}

      {events.map((event) => {
        // Skip rendering if event is missing crucial data
        if (!event || !event._id) {
          console.error("Invalid event data:", event);
          return null;
        }

        console.log("Rendering event in day column:", event.title);

        try {
          const startTime =
            typeof event.startTime === "string"
              ? parseISO(event.startTime)
              : event.startTime;
          const endTime =
            typeof event.endTime === "string"
              ? parseISO(event.endTime)
              : event.endTime;

          // Validate time data
          if (!startTime || isNaN(startTime.getTime())) {
            console.error("Invalid start time for event:", event);
            return null;
          }

          if (!endTime || isNaN(endTime.getTime())) {
            console.error("Invalid end time for event:", event);
            return null;
          }

          const startHour = getHours(startTime) + getMinutes(startTime) / 60;
          const endHour = getHours(endTime) + getMinutes(endTime) / 60;

          // Ensure duration is at least 30 minutes for visibility
          const duration = Math.max(0.5, endHour - startHour);

          const top = startHour * 80;
          const height = duration * 80;

          return (
            <CalendarEvent
              key={event._id}
              event={event}
              style={{ top: `${top}px`, height: `${height}px` }}
              onClick={() => onEventClick(event)}
            />
          );
        } catch (error) {
          console.error("Error rendering event:", error, event);
          return null;
        }
      })}
    </div>
  );
}
