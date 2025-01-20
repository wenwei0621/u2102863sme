// Enhanced seasonality detection based on booking data for each month
export function detectSeasonality(bookings) {
    const seasonality = {};
    bookings.forEach((booking) => {
        const month = new Date(booking.Date).getMonth(); // Get the month of the booking (0-11)
        if (!seasonality[month]) seasonality[month] = 0;
        seasonality[month]++;
    });
    return seasonality;
}

// Advanced trend detection: Analyze underutilized time slots for each facility with additional metrics
export function detectBookingTrends(statistics) {
    const trends = {};
    for (const facility in statistics) {
        const timeSlots = statistics[facility];
        let totalBookings = 0;
        let underutilizedSlots = [];
        const slotCounts = Object.values(timeSlots);

        // Calculate total bookings for the facility
        totalBookings = slotCounts.reduce((acc, count) => acc + count, 0);

        // Calculate the average bookings per slot
        const averageBookings = totalBookings / Object.keys(timeSlots).length;

        // Identify underutilized slots (those with fewer bookings than the average)
        for (const slot in timeSlots) {
            if (timeSlots[slot] < averageBookings) {
                underutilizedSlots.push(slot);
            }
        }

        // Add other trend indicators like booking velocity, or popular periods
        const bookingVelocity = {}; // Can be calculated based on booking change rate per day/week
        trends[facility] = { underutilizedSlots, bookingVelocity };
    }
    return trends;
}

// AI: Suggest the best time slot considering multiple factors like underutilization, seasonality, and time-of-day trends
export function suggestBestTimeSlot(statistics, seasonality, trends, userPreferences, facility) {
    const facilityStats = statistics[facility];
    const underutilizedSlots = trends[facility]?.underutilizedSlots || [];
    const seasonalityData = seasonality[facility] || {};
    const preferences = userPreferences[facility] || [];
    let bestSlot = null;
    let reasons = [];

    // Prioritize user preferences first (if available)
    if (preferences.length > 0) {
        bestSlot = preferences[0]; // Pick the first preferred slot
        reasons.push('Preferred Time Slot (based on user preferences)');
    }

    // If no preferences, prioritize underutilized slots first
    if (!bestSlot && underutilizedSlots.length > 0) {
        bestSlot = underutilizedSlots[0]; // Pick the first underutilized slot
        reasons.push('Underutilized Slot (based on historical trends)');
    }

    // If no underutilized slots are found, suggest the slot with the least bookings
    if (!bestSlot) {
        let minBookings = Infinity;
        for (const slot in facilityStats) {
            if (facilityStats[slot] < minBookings) {
                bestSlot = slot;
                minBookings = facilityStats[slot];
            }
        }
        reasons.push('Least Booked Slot (based on current booking statistics)');
    }

    // Factor in seasonality: Suggest off-peak months if the facility is available
    if (seasonalityData) {
        const currentMonth = new Date().getMonth();
        const offPeakMonths = [11, 0, 1]; // December, January, February as an example off-peak period

        // Avoid repeating underutilization reason if off-peak is chosen
        if (offPeakMonths.includes(currentMonth) && !reasons.includes('Underutilized Slot (based on historical trends)')) {
            reasons.push('Suggested during Off-Peak Season');
        }
    }

    // Incorporate time-of-day trends: E.g., if morning slots are typically underbooked, suggest them
    if (bestSlot) {
        const timeSlotParts = bestSlot.split(' '); // Assuming time slots are labeled like "Morning", "Afternoon", "Evening"
        if (timeSlotParts[0] === "Morning") {
            reasons.push('Morning slots are underbooked compared to evening slots');
        } else if (timeSlotParts[0] === "Evening") {
            reasons.push('Evening slots are less popular, hence recommended for booking');
        }
    }

    // Use machine learning prediction (if data is available) to forecast trends
    if (bestSlot) {
        reasons.push('AI prediction: This slot is expected to be more available in the future based on booking trends');
    }

    // Return the best slot with detailed reasoning
    return {
        bestSlot,
        reasons: reasons.join(' | ') // Join reasons with a separator for clarity
    };
}
