import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Event() {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [sortOrder, setSortOrder] = useState("newest"); // Sorting state
  const [dateFilter, setDateFilter] = useState(""); // New state for date filtering
  const [selectedDate, setSelectedDate] = useState(""); // Store selected date
  const [loading, setLoading] = useState(true); // Loading state

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Items per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true); // Set loading to true while fetching
      try {
        const querySnapshot = await getDocs(collection(db, "Event"));
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events: ", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchEvents();
  }, []);

  // Check if an event is new (within 3 days)
  const isNew = (createdAt) => {
    const currentTime = new Date().getTime();
    const eventTime = new Date(createdAt.seconds * 1000).getTime();
    const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000; // 3 days
    return currentTime - eventTime <= threeDaysInMilliseconds;
  };

  // Sorting the events based on the selected sort order
  const sortedEvents = [...events].sort((a, b) => {
    if (sortOrder === "newest") {
      return b.createdAt.seconds - a.createdAt.seconds; // Newest first
    } else {
      return a.createdAt.seconds - b.createdAt.seconds; // Oldest first
    }
  });

  // Filter events by search query and selected date
  const filterByDate = (event) => {
    if (!dateFilter || !selectedDate) return true;

    const eventDate = new Date(event.createdAt.seconds * 1000);
    const filterDate = new Date(selectedDate);

    if (dateFilter === "day") {
      return (
        eventDate.getDate() === filterDate.getDate() &&
        eventDate.getMonth() === filterDate.getMonth() &&
        eventDate.getFullYear() === filterDate.getFullYear()
      );
    } else if (dateFilter === "month") {
      return (
        eventDate.getMonth() === filterDate.getMonth() &&
        eventDate.getFullYear() === filterDate.getFullYear()
      );
    } else if (dateFilter === "year") {
      return eventDate.getFullYear() === filterDate.getFullYear();
    }
    return true;
  };

  // Pagination logic
  const filteredEvents = sortedEvents.filter(
    (event) =>
      (event.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.Description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      filterByDate(event)
  );

  // Get current page events
  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Total pages
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const toggleExpand = (id) => {
    setExpandedCards((prevExpanded) => ({
      ...prevExpanded,
      [id]: !prevExpanded[id],
    }));
  };

  return (
    <Container className="mt-4">
      <h3
        className="text-center text-white fw-bold py-3 mb-4"
        style={{
          background:
            "linear-gradient(45deg,rgb(43, 21, 143),rgb(82, 37, 243))", // Bootstrap primary color
          borderRadius: "15px",
          fontSize: "2.5rem",
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}
      >
        Events
      </h3>

      <Row className=" align-items-center">
        <Col md={8}>
          <Form.Control
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
        </Col>
        <Col md={4}>
          {/* Sorting Dropdown */}
          <Form.Select
            aria-label="Sort by"
            className="mb-4"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest to Oldest</option>
            <option value="oldest">Oldest to Newest</option>
          </Form.Select>
        </Col>
      </Row>
      {/* Date Filter Dropdown */}
      {/* <Form.Select
        aria-label="Filter by Date"
        className="mb-4"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
      >
        <option value="">Filter by Date</option>
        <option value="day">Day</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </Form.Select> */}

      {/* Date Picker */}
      {/* {dateFilter && (
        <Form.Control
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mb-4"
        />
      )} */}

      {/* Loading Indicator */}
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Row className="justify-content-center">
          {currentEvents.length > 0 ? (
            currentEvents.map((event) => (
              <Col xs={12} key={event.id} className="my-3">
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <Row>
                      <Col xs={12} md={3} className="mb-3 mb-md-0 text-center">
                        <div
                          className=" text-white py-3 rounded mx-auto"
                          style={{
                            maxWidth: "200px",
                            backgroundColor: "rgb(82, 37, 243)",
                            color: "#3150b5",
                          }}
                        >
                          <div className="fs-5">
                            {new Date(
                              event.createdAt.seconds * 1000
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div>
                            {new Date(
                              event.createdAt.seconds * 1000
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} md={9}>
                        {isNew(event.createdAt) && (
                          <Badge
                            bg="success"
                            className="ms-2"
                            style={{
                              backgroundColor: "#007bff", // Bootstrap primary color
                              marginBottom: "10px",
                              fontSize: "14px",
                            }}
                          >
                            New
                          </Badge>
                        )}
                        <Card.Title
                          className=""
                          style={{
                            color: "rgb(43, 21, 143)",
                            fontWeight: "bold",
                          }}
                        >
                          {event.Title.length > 200
                            ? `${event.Title.slice(0, 200)}...`
                            : event.Title}
                        </Card.Title>

                        <div className="justify-content-between align-items-center">
                          <div>
                            {expandedCards[event.id] ? (
                              <Card.Text
                                dangerouslySetInnerHTML={{
                                  __html: event.Description,
                                }}
                              />
                            ) : (
                              <Card.Text
                                dangerouslySetInnerHTML={{
                                  __html: event.Description.slice(0, 0),
                                }}
                              />
                            )}
                          </div>

                          <Button
                            variant="outline-primary"
                            className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 mt-2 text-uppercase fw-bold text-center"
                            onClick={() => toggleExpand(event.id)}
                          >
                            {expandedCards[event.id] ? (
                              <>
                                <i className="bi bi-chevron-up me-2"></i>{" "}
                                Collapse
                              </>
                            ) : (
                              <>
                                <i className="bi bi-chevron-down me-2"></i> Read
                                More
                              </>
                            )}
                          </Button>

                          <div className="mt-3">
                            {event.File && (
                              <a
                                href={event.File}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-sm d-inline-flex align-items-center"
                                style={{
                                  textDecoration: "none",
                                  color: "white",
                                  fontWeight: "bold",
                                  borderRadius: "20px",
                                  padding: "8px 15px",
                                }}
                              >
                                <span style={{ marginRight: "8px" }}>📄</span>{" "}
                                View File
                              </a>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <p className="text-center">No Events Found</p>
            </Col>
          )}
        </Row>
      )}

      {/* Pagination */}
      <div
        className="d-flex justify-content-center my-3"
        style={{ paddingBottom: "20px" }}
      >
        <Button
          variant="outline-primary"
          disabled={currentPage === 1}
          onClick={() => paginate(currentPage - 1)}
        >
          Previous
        </Button>
        <span className="mx-3">{`${currentPage} of ${totalPages}`}</span>
        <Button
          variant="outline-primary"
          disabled={currentPage === totalPages}
          onClick={() => paginate(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </Container>
  );
}

export default Event;
