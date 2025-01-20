// aiBookingPredictor.js

export function getBookingRecommendations(bookingsData) {
  if (!Array.isArray(bookingsData) || bookingsData.length === 0) {
    console.error("Invalid bookings data:", bookingsData);
    return [];
  }

  // Organize bookings by facility
  const bookingsByFacility = bookingsData.reduce((acc, booking) => {
    const facility = booking.Facility;
    if (!acc[facility]) acc[facility] = [];
    acc[facility].push(booking);
    return acc;
  }, {});

  // Prepare an object to store time slot recommendations for each facility
  const recommendations = {};

  // Helper function to format a time slot into a human-readable format
  const formatTime = (hour) => `${hour}:00`;

  // Iterate over each facility and analyze time slots
  Object.keys(bookingsByFacility).forEach((facility) => {
    const facilityBookings = bookingsByFacility[facility];

    // Ensure bookingDate is a Date object before using getHours
    const timeSlots = facilityBookings.map((booking) => {
      const bookingDate = booking.bookingDate instanceof Date
        ? booking.bookingDate
        : new Date(booking.bookingDate);
      return bookingDate.getHours();
    });

    // Count bookings per time slot
    const timeSlotCount = timeSlots.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // Sort time slots by the most popular
    const sortedTimeSlots = Object.entries(timeSlotCount).sort((a, b) => b[1] - a[1]);

    // Generate recommendations (top 3 time slots)
    recommendations[facility] = sortedTimeSlots.slice(0, 3).map(([hour, count]) => {
      const formattedHour = formatTime(hour);
      return `For ${facility}, the most popular time slot is ${formattedHour} with ${count} bookings.`;
    });
  });

  return recommendations;
}
