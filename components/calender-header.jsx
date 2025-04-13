"use client";

import { useState } from "react";
import { format, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CalendarHeader({ currentDate, onDateChange }) {
  const [date, setDate] = useState(currentDate);

  const handlePrevWeek = () => {
    onDateChange(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    onDateChange(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleDateSelect = (selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
      onDateChange(selectedDate);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-2">
        <Button variant="outline" onClick={handleToday}>
          Today
        </Button>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="ml-2">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(currentDate, "MMMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
