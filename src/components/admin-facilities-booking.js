import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { toast } from "react-toastify";
import {
  Button,
  Form,
  Table,
  Container,
  Row,
  Col,
  Pagination,
  Spinner,
} from "react-bootstrap";
import { FaArrowUp, FaArrowDown } from "react-icons/fa"; // Updated icons
import Modal from "react-modal";

function AdminFacilitiesbooking() {
  const [facilitiesbookings, setFacilitiesbookings] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [rejectFacilitiesbookingId, setRejectFacilitiesbookingId] =
    useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(""); // State for the selected date
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 20; // Number of bookings per page
  const [selectedStatus, setSelectedStatus] = useState(""); // State for selected status filter
  const [selectedFacilities, setSelectedFacilities] = useState(""); // State for selected status filter
  const [facilities, setFacilities] = useState([]); // State to store unique status
  const [status, setStatus] = useState([]); // State to store unique status
  const [sortConfig, setSortConfig] = useState({
    key: "Date",
    direction: "desc",
  }); // Default sort by Date, descending

  const fetchFacilitiesbookings = async () => {
    // setLoading(true);
    try {
      const q = query(
        collection(db, "Facilitiesbooking"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const facilitiesbookingsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFacilitiesbookings(facilitiesbookingsData);

      // Extract unique facility from the fetched bookings
      const uniqueFacilities = [
        ...new Set(facilitiesbookingsData.map((booking) => booking.Facility)),
      ];
      setFacilities(uniqueFacilities);

      // Extract unique status from the fetched bookings
      const uniqueStatus = [
        ...new Set(facilitiesbookingsData.map((booking) => booking.Status)),
      ];
      setStatus(uniqueStatus);
    } catch (error) {
      console.error("Error fetching facilities bookings: ", error);
      toast.error("Failed to load facilities bookings.", {
        position: "top-center",
      });
    }
  };

  const handleReject = async (id) => {
    try {
      const bookingRef = doc(db, "Facilitiesbooking", id);
      await updateDoc(bookingRef, { Status: "Rejected" });

      setFacilitiesbookings(
        facilitiesbookings.map((booking) =>
          booking.id === id ? { ...booking, Status: "Rejected" } : booking
        )
      );

      toast.success("Facilities booking successfully rejected!", {
        position: "top-center",
      });
      closeModal();
    } catch (error) {
      console.error("Error rejecting facilities booking: ", error);
      toast.error("Failed to reject facilities booking. Please try again.", {
        position: "top-center",
      });
    }
  };

  const openModal = (id) => {
    setRejectFacilitiesbookingId(id);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setRejectFacilitiesbookingId(null);
  };

  useEffect(() => {
    fetchFacilitiesbookings();
  }, []);

  // Filter and paginate bookings
  const filteredFacilitiesbookings = facilitiesbookings.filter((booking) => {
    const matchesFacilitiesFilter =
      !selectedFacilities || booking.Facility === selectedFacilities; // Apply the selected status filter

    const matchesDateFilter = !selectedDate || booking.Date === selectedDate;

    const matchesStatusFilter =
      !selectedStatus || booking.Status === selectedStatus; // Apply the selected status filter

    return matchesFacilitiesFilter && matchesDateFilter && matchesStatusFilter;
  });

  // Sort facilities bookings by the selected column and order
  const sortedFacilitiesbookings = filteredFacilitiesbookings.sort((a, b) => {
    const { key, direction } = sortConfig;

    const dateA = new Date(a[key]);
    const dateB = new Date(b[key]);

    // Sort in ascending or descending order
    return direction === "asc" ? dateA - dateB : dateB - dateA;
  });

  const handleSort = (key) => {
    setSortConfig((prevState) => {
      if (prevState.key === key) {
        // Toggle the sort direction
        return {
          ...prevState,
          direction: prevState.direction === "asc" ? "desc" : "asc",
        };
      } else {
        // Set default direction to descending if switching columns
        return {
          key: key,
          direction: "desc",
        };
      }
    });
  };

  const getSortIcon = (column) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === "asc" ? <FaArrowUp /> : <FaArrowDown />;
    }
    return <FaArrowUp />; // Default icon when no sorting applied to this column
  };

  const totalPages = Math.ceil(
    filteredFacilitiesbookings.length / bookingsPerPage
  );
  const paginatedBookings = filteredFacilitiesbookings.slice(
    (currentPage - 1) * bookingsPerPage,
    currentPage * bookingsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Function to determine the badge style for the status
  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "badge bg-secondary text-white status-badge"; // Green for Completed
      case "Rejected":
        return "badge bg-danger text-white status-badge"; // Red for Cancelled
      case "Upcoming":
        return "badge bg-info text-dark status-badge"; // Yellow for Upcoming
      default:
        return "badge bg-warning text-white status-badge"; // Default grey for unknown status
    }
  };

  const formatTimeSlots = (timeSlots) => {
    console.log("TimeSlots data: ", timeSlots);

    if (!timeSlots) return ""; // Return an empty string if no time slots

    // Check if timeSlots is an array
    if (Array.isArray(timeSlots)) {
      // Sort the time slots in ascending order by the start time
      const sortedTimeSlots = timeSlots.sort((a, b) => {
        // Extract the start times of each time slot (the part before the ' - ' symbol)
        const timeA = a.split(" - ")[0].trim();
        const timeB = b.split(" - ")[0].trim();

        // Convert the time strings into Date objects for comparison
        const [hourA, minuteA, periodA] = timeA
          .match(/(\d+):(\d+) (AM|PM)/)
          .slice(1);
        const [hourB, minuteB, periodB] = timeB
          .match(/(\d+):(\d+) (AM|PM)/)
          .slice(1);

        // Convert to 24-hour format for comparison
        const hoursA = (parseInt(hourA) % 12) + (periodA === "PM" ? 12 : 0);
        const hoursB = (parseInt(hourB) % 12) + (periodB === "PM" ? 12 : 0);
        const minutesA = parseInt(minuteA);
        const minutesB = parseInt(minuteB);

        // Compare the times
        const timeAInMinutes = hoursA * 60 + minutesA;
        const timeBInMinutes = hoursB * 60 + minutesB;

        return timeAInMinutes - timeBInMinutes;
      });

      // Return the sorted time slots as a comma-separated string
      return sortedTimeSlots.join(", ");
    }

    // If it's a string (just in case), split and return as before
    if (typeof timeSlots === "string") {
      const timeSlotsArray = timeSlots.split(",").map((slot) => slot.trim());
      const sortedTimeSlots = timeSlotsArray.sort((a, b) => {
        // Extract the start times of each time slot (the part before the ' - ' symbol)
        const timeA = a.split(" - ")[0].trim();
        const timeB = b.split(" - ")[0].trim();

        // Convert the time strings into Date objects for comparison
        const [hourA, minuteA, periodA] = timeA
          .match(/(\d+):(\d+) (AM|PM)/)
          .slice(1);
        const [hourB, minuteB, periodB] = timeB
          .match(/(\d+):(\d+) (AM|PM)/)
          .slice(1);

        // Convert to 24-hour format for comparison
        const hoursA = (parseInt(hourA) % 12) + (periodA === "PM" ? 12 : 0);
        const hoursB = (parseInt(hourB) % 12) + (periodB === "PM" ? 12 : 0);
        const minutesA = parseInt(minuteA);
        const minutesB = parseInt(minuteB);

        // Compare the times
        const timeAInMinutes = hoursA * 60 + minutesA;
        const timeBInMinutes = hoursB * 60 + minutesB;

        return timeAInMinutes - timeBInMinutes;
      });

      return sortedTimeSlots.join(", ");
    }

    // Return the original timeSlots if it's neither a string nor an array
    console.warn("Unexpected timeSlots data: ", timeSlots);
    return timeSlots;
  };

  return (
    <Container className="mt-4">
      <h3
        className="text-center text-white fw-bold py-3 mb-4"
        style={{
          background: "linear-gradient(45deg,rgb(0, 82, 175),rgb(0, 105, 224))", // Bootstrap primary color
          borderRadius: "15px",
          fontSize: "2.5rem",
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}
      >
        Facilities Booking History
      </h3>

      <Row className="mb-4">
        <Col md={4} className="align-items-center mt-sm-3 mt-md-0">
          <Row className=" align-items-center">
            <Col md={4}>
              <Form.Label className="fw-bold">Filter by Facility:</Form.Label>
            </Col>
            <Col md={8}>
              <Form.Select
                value={selectedFacilities}
                onChange={(e) => setSelectedFacilities(e.target.value)}
                className="shadow-sm"
              >
                <option value="">Select Facility</option>
                {facilities.map((facilities, index) => (
                  <option key={index} value={facilities}>
                    {facilities}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Col>
        <Col md={4} className="align-items-center mt-sm-3 mt-md-0">
          <Row className=" align-items-center">
            <Col md={4}>
              <Form.Label className="fw-bold">Filter by Status:</Form.Label>
            </Col>
            <Col md={8}>
              <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="shadow-sm"
              >
                <option value="">Select Status</option>
                {status.map((status, index) => (
                  <option key={index} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Col>
        <Col md={4} className="align-items-center mt-sm-3 mt-md-0">
          <Row className=" align-items-center">
            <Col md={4}>
              <Form.Label className="fw-bold">
                Filter by Booking Date:
              </Form.Label>
            </Col>
            <Col md={8}>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="shadow-sm"
              />
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Loading...</p>
        </div>
      ) : (
        <Table responsive bordered hover className="shadow-sm">
          <thead className="table-info text-white">
            <tr>
              <th
                onClick={() => handleSort("createdAt")}
                style={{ cursor: "pointer" }}
              >
                Booked On {getSortIcon("createdAt")}
              </th>
              <th>Facility</th>
              <th
                onClick={() => handleSort("Date")}
                style={{ cursor: "pointer" }}
              >
                Booking Date {getSortIcon("Date")}
              </th>
              <th>Time Slots</th>
              <th>Status</th>
              <th>User Email</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.length > 0 ? (
              paginatedBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.createdAt}</td>
                  <td>{booking.Facility}</td>
                  <td>{booking.Date}</td>
                  <td>{formatTimeSlots(booking.TimeSlots)}</td>
                  <td className="text-center">
                    <span className={getStatusBadge(booking.Status)}>
                      {booking.Status || "Pending"}
                    </span>
                  </td>
                  <td>{booking.userEmail || "N/A"}</td>
                  <td className="text-center">
                    {/* Conditionally render the Reject button based on the status */}
                    {booking.Status === "Upcoming" ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => openModal(booking.id)}
                        className="shadow-sm"
                      >
                        Reject
                      </Button>
                    ) : (
                      <span>No Actions</span> // You can display something else or leave empty
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No facilities booking found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <Pagination className="justify-content-center mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <Pagination.Item
            key={i + 1}
            active={i + 1 === currentPage}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
      </Pagination>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Confirm Reject"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <h4 className="mb-3">Confirm Reject</h4>
        <p>Are you sure you want to reject this booking?</p>
        <Button variant="secondary" onClick={closeModal} className="me-2">
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => handleReject(rejectFacilitiesbookingId)}
        >
          Reject
        </Button>
      </Modal>
    </Container>
  );
}

export default AdminFacilitiesbooking;
