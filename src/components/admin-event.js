import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Badge,
  Modal,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // For Firebase storage operations
import { storage } from "./firebase"; // Assuming you have initialized Firebase storage in your firebase.js file
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function AdminEvent() {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [editEvent, setEditEvent] = useState({
    id: "",
    Title: "",
    Description: "",
    File: null,
  });
  const [newFile, setNewFile] = useState(null);
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

        // Sort events by createdAt field in descending order
        eventsData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

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

  const handleDelete = async () => {
    if (!eventToDelete) return;

    try {
      await deleteDoc(doc(db, "Event", eventToDelete));
      setEvents((prev) => prev.filter((a) => a.id !== eventToDelete));
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Error deleting event: ", error);
    }
  };

  const openEditModal = (event) => {
    setEditEvent(event);
    setEditModalIsOpen(true);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    setEditEvent({ id: "", Title: "", Description: "", File: null });
    setNewFile(null);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    let fileURL = editEvent.File;

    if (newFile) {
      const fileRef = ref(storage, `events/${newFile.name}`);
      try {
        await uploadBytes(fileRef, newFile);
        fileURL = await getDownloadURL(fileRef);
      } catch (uploadError) {
        console.error("Error uploading file: ", uploadError);
        return;
      }
    }

    try {
      await updateDoc(doc(db, "Event", editEvent.id), {
        Title: editEvent.Title,
        Description: editEvent.Description,
        File: fileURL,
        updatedAt: new Date(),
      });

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === editEvent.id
            ? {
                ...event,
                Title: editEvent.Title,
                Description: editEvent.Description,
                File: fileURL,
              }
            : event
        )
      );
      closeEditModal();
    } catch (error) {
      console.error("Error updating event: ", error);
    }
  };

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

      {/* Loading Indicator */}
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Row className="justify-content-center">
          {currentEvents.length > 0 ? (
            currentEvents.map((event) => (
              <Col xs={12} key={event.id} className="mb-4">
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <Row>
                      <Col xs={12} md={3} className="mb-3 mb-md-0 text-center">
                        <div
                          className="text-white py-3 rounded mx-auto"
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
                        {/* <div className="justify-content-between"> */}
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
                        {/* </div> */}

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

                    <div className="d-flex justify-content-end mt-3">
                      <FaEdit
                        className="text-warning me-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => openEditModal(event)}
                      />
                      <FaTrash
                        className="text-danger"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setEventToDelete(event.id);
                          setShowDeleteModal(true);
                        }}
                      />
                    </div>
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

      <button
        onClick={() => navigate("/addEvent")}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "24px",
        }}
      >
        <FaPlus />
      </button>

      {/* Pagination */}
      <div
        className="d-flex justify-content-center mt-4 padding"
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
      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this event?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={editModalIsOpen} onHide={closeEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEdit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editEvent.Title}
                onChange={(e) =>
                  setEditEvent({
                    ...editEvent,
                    Title: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            {/* <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editEvent.Description}
                onChange={(e) =>
                  setEditEvent({
                    ...editEvent,
                    Description: e.target.value,
                  })
                }
                required
              />
            </Form.Group> */}

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <ReactQuill
                value={editEvent.Description}
                onChange={(value) =>
                  setEditEvent({
                    ...editEvent,
                    Description: value,
                  })
                }
                theme="snow"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Current File</Form.Label>
              {editEvent.File ? (
                <div>
                  <a
                    href={editEvent.File}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {editEvent.File.split("/").pop().split("?")[0]}
                  </a>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      setEditEvent({
                        ...editEvent,
                        File: null, // Remove the file
                      })
                    }
                    className="ms-2"
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <p>No file uploaded</p>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Upload New File</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setNewFile(e.target.files[0])}
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={closeEditModal}
                className="me-2"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default AdminEvent;
