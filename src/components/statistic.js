// functionable statistic page

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Spinner, Container, Alert, Card, Row, Col, Button } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [facilitiesData, setFacilitiesData] = useState({});
  const [error, setError] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [selectedFacility, setSelectedFacility] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Facilitiesbooking"));
        const data = querySnapshot.docs.map((doc) => doc.data());

        const facilityStats = {};
        data.forEach((booking) => {
          const facility = booking.Facility;
          const timeSlots = booking.TimeSlots || [];

          if (!facilityStats[facility]) {
            facilityStats[facility] = {};
          }

          timeSlots.forEach((slot) => {
            if (!facilityStats[facility][slot]) {
              facilityStats[facility][slot] = 0;
            }
            facilityStats[facility][slot]++;
          });
        });

        setFacilitiesData(facilityStats);

        // Generate AI suggestions for each facility
        const suggestions = {};
        Object.keys(facilityStats).forEach((facility) => {
          const timeSlots = facilityStats[facility];
          const bookings = Object.entries(timeSlots);

          const minBookings = Math.min(...bookings.map(([_, count]) => count));
          const leastBusySlots = bookings
            .filter(([_, count]) => count === minBookings)
            .map(([slot]) => slot);

          const maxBookings = Math.max(...bookings.map(([_, count]) => count));
          const mostBusySlots = bookings
            .filter(([_, count]) => count === maxBookings)
            .map(([slot]) => slot);

          suggestions[facility] = {
            leastBusy: {
              times: leastBusySlots,
              reason: "These time slots have the fewest bookings, ensuring a quieter experience.",
            },
            mostBusy: {
              times: mostBusySlots,
              reason: "These time slots are popular and might require advance booking.",
            },
          };
        });

        setAiSuggestions(suggestions);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate bar chart data for a specific facility
  const generateChartData = (facility) => {
    const timeSlots = facilitiesData[facility];
    const labels = Object.keys(timeSlots).sort(); // Sort time slots
    const data = labels.map((slot) => timeSlots[slot]);

    return {
      labels,
      datasets: [
        {
          label: "Number of Bookings",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const renderFacilityDetails = (facility) => {
    return (
      <div key={facility} className="mb-5">
        <Card className="mb-3 shadow-lg">
          <Card.Header>
            <h5 className="text-center text-primary">{facility}</h5>
          </Card.Header>
          <Card.Body>
            <Bar
              data={generateChartData(facility)}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: `${facility} Booking Time Slots`,
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Time Slots",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Number of Bookings",
                    },
                    beginAtZero: true,
                  },
                },
              }}
            />
            <div className="mt-3">
              <h5 className="text-success">Suggestions:</h5>
              <Alert variant="info">
                <strong>Least Busy Slots:</strong>{" "}
                {aiSuggestions[facility]?.leastBusy?.times?.length
                  ? aiSuggestions[facility].leastBusy.times.join(", ")
                  : "No suggestions available"}{" "}
                <br />
                <strong>Reason:</strong> {aiSuggestions[facility]?.leastBusy?.reason}
              </Alert>
              <Alert variant="warning">
                <strong>Most Busy Slots:</strong>{" "}
                {aiSuggestions[facility]?.mostBusy?.times?.length
                  ? aiSuggestions[facility].mostBusy.times.join(", ")
                  : "No suggestions available"}{" "}
                <br />
                <strong>Reason:</strong> {aiSuggestions[facility]?.mostBusy?.reason}
              </Alert>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  };

  return (
    <Container className="mt-4">
      <h3 className="text-center text-primary mb-4">Facility Booking Statistics</h3>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Loading statistics...</p>
        </div>
      ) : error ? (
        <div className="text-danger text-center">{error}</div>
      ) : (
        <div>
          {/* Filter by Facility */}
          <Row className="mb-4">
            <Col>
              <Button
                variant="outline-primary"
                onClick={() => setSelectedFacility(null)}
                className="w-100"
              >
                View All Facilities
              </Button>
            </Col>
            {Object.keys(facilitiesData).map((facility) => (
              <Col key={facility}>
                <Button
                  variant="outline-secondary"
                  onClick={() => setSelectedFacility(facility)}
                  className="w-100"
                >
                  {facility}
                </Button>
              </Col>
            ))}
          </Row>

          {/* Render selected facility or all facilities */}
          {selectedFacility
            ? renderFacilityDetails(selectedFacility)
            : Object.keys(facilitiesData).map(renderFacilityDetails)}
        </div>
      )}
    </Container>
  );
};

export default Statistics;
