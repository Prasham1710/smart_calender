const renderDayColumns = () => {
  // ... existing code ...

  // Add safety check
  const filteredEvents = Array.isArray(events)
    ? events.filter(/* your filter condition */)
    : [];

  // ... rest of the code ...
};
