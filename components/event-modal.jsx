"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  fetchEvents,
} from "@/redux/slices/eventsSlice";

export function EventModal({ isOpen, onClose, selectedSlot, selectedEvent }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("work");
  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [goalColor, setGoalColor] = useState("");
  const [eventType, setEventType] = useState("event");
  const [relatedId, setRelatedId] = useState("");

  useEffect(() => {
    console.log("EventModal useEffect - selectedEvent:", selectedEvent);
    console.log("EventModal useEffect - selectedSlot:", selectedSlot);

    try {
      if (selectedEvent) {
        setTitle(selectedEvent.title || "");
        setCategory(selectedEvent.category || "work");

        // Handle date
        const eventDate = selectedEvent.date
          ? new Date(selectedEvent.date)
          : new Date();
        setDate(eventDate);

        // Handle times
        const startTimeDate = selectedEvent.startTime
          ? new Date(selectedEvent.startTime)
          : new Date();
        const endTimeDate = selectedEvent.endTime
          ? new Date(selectedEvent.endTime)
          : new Date();
        setStartTime(format(startTimeDate, "HH:mm"));
        setEndTime(format(endTimeDate, "HH:mm"));

        setGoalColor(selectedEvent.goalColor || "");
        setEventType(selectedEvent.eventType || "event");
        setRelatedId(selectedEvent.relatedId || "");
      } else if (selectedSlot) {
        // Handle task data if it was provided
        setTitle(selectedSlot.title || "");
        setCategory("work");

        // Handle date
        const slotDate = selectedSlot.date
          ? new Date(selectedSlot.date)
          : new Date();
        setDate(slotDate);

        // Handle times
        const startTimeDate = selectedSlot.startTime
          ? new Date(selectedSlot.startTime)
          : new Date();
        const endTimeDate = selectedSlot.endTime
          ? new Date(selectedSlot.endTime)
          : new Date();
        setStartTime(format(startTimeDate, "HH:mm"));
        setEndTime(format(endTimeDate, "HH:mm"));

        setGoalColor(selectedSlot.goalColor || "");

        // Determine event type based on drag source
        if (selectedSlot.taskId) {
          setEventType("task");
          setRelatedId(selectedSlot.taskId || "");
        } else {
          setEventType("event");
          setRelatedId("");
        }

        console.log("EventModal form initialized with:", {
          title: selectedSlot.title || "",
          date: slotDate,
          startTime: format(startTimeDate, "HH:mm"),
          endTime: format(endTimeDate, "HH:mm"),
          goalColor: selectedSlot.goalColor || "",
          eventType: eventType,
          relatedId: relatedId,
        });
      }
    } catch (error) {
      console.error("Error setting modal data:", error);
    }
  }, [selectedEvent, selectedSlot]);

  const handleSubmit = () => {
    console.log("Submit button clicked");
    console.log("Form data:", {
      title,
      date,
      startTime,
      endTime,
      category,
      goalColor,
      eventType,
      relatedId,
    });

    if (!title) {
      console.error("Missing title");
      return;
    }

    // Validate date
    let validDate = date;
    if (!validDate) {
      console.error("Missing date, using current date");
      validDate = new Date();
    } else if (!(validDate instanceof Date) || isNaN(validDate.getTime())) {
      console.error("Invalid date object, using current date");
      validDate = new Date();
    }

    // Parse time strings
    let parsedStartTime, parsedEndTime;
    try {
      if (!startTime) {
        console.error("Missing start time");
        return;
      }

      if (!endTime) {
        console.error("Missing end time");
        return;
      }

      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      // Create date objects with the times
      parsedStartTime = new Date(validDate);
      parsedStartTime.setHours(startHour, startMinute, 0);

      parsedEndTime = new Date(validDate);
      parsedEndTime.setHours(endHour, endMinute, 0);

      console.log("Parsed start time:", parsedStartTime);
      console.log("Parsed end time:", parsedEndTime);
    } catch (error) {
      console.error("Error parsing times:", error);
      return;
    }

    // Create the event data with validated fields
    const eventData = {
      title,
      category,
      date: validDate,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      goalColor,
      eventType,
      relatedId,
    };

    console.log("Creating event with data:", eventData);

    if (selectedEvent) {
      console.log("Updating existing event:", selectedEvent._id);
      dispatch(updateEvent({ ...eventData, _id: selectedEvent._id }));
      onClose();
    } else {
      console.log("Creating new event");

      // Create event and force a refresh of the events list
      dispatch(createEvent(eventData))
        .then((result) => {
          console.log("Event creation result:", result);
          // Add a small delay before closing the modal to ensure Redux updates
          setTimeout(() => {
            onClose();
            // Optionally reload the page or dispatch fetchEvents again
            // dispatch(fetchEvents());
          }, 100);
        })
        .catch((error) => {
          console.error("Failed to create event:", error);
          alert("Failed to create event. Check console for details.");
        });
    }
  };

  const handleDelete = () => {
    if (selectedEvent) {
      dispatch(deleteEvent(selectedEvent._id));
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedEvent ? "Edit Event" : "Create Event"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exercise">Exercise</SelectItem>
                <SelectItem value="eating">Eating</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="relax">Relax</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date ? format(date, "yyyy-MM-dd") : ""}
              onChange={(e) =>
                setDate(e.target.value ? new Date(e.target.value) : null)
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          {selectedEvent && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <div>
            <Button variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              {selectedEvent ? "Update" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
