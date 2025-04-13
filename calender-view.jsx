import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const CalendarView = () => {
  const handleEventMove = (eventId, newDate) => {
    // Update event date in your state/database
    // You'll need to implement this based on your data management approach
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <CalendarGrid onEventMove={handleEventMove} />
    </DndProvider>
  );
};
