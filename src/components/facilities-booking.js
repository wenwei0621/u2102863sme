import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { FaTrash, FaPlus, FaArrowUp, FaArrowDown } from "react-icons/fa"; // Updated icons
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Table,
  Container,
  Row,
  Col,
  Pagination,
} from "react-bootstrap";
import { getAuth } from "firebase/auth";
import { Spinner } from "react-bootstrap";

function Facilitiesbooking() {
  const [facilitiesbookings, setFacilitiesbookings] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteFacilitiesbookingId, setDeleteFacilitiesbookingId] =
    useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [sortConfig, setSortConfig] = useState({
    key: "Date",
    direction: "desc",
  }); // Default sort by Date, descending
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [itemsPerPage] = useState(15); // Fixed items per page
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(""); // State for selected status filter
  const [status, setStatus] = useState([]); // State to store unique status
  const [selectedFacilities, setSelectedFacilities] = useState(""); // State for selected status filter
  const [facilities, setFacilities] = useState([]); // State to store unique status

  // Fetch bookings from Firestore
  const fetchFacilitiesbookings = async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast.error("You must be logged in to view bookings.", {
          position: "top-center",
        });
        setLoading(false); // Stop loading if user is not logged in
        return;
      }

      const q = query(
        collection(db, "Facilitiesbooking"),
        where("userId", "==", user.uid) // Filter by userId
      );
      const querySnapshot = await getDocs(q);

      const facilitiesbookingsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // // Check if the booking date is in the past, update status to 'Completed' if not 'Cancelled'
      // const updatedBookings = facilitiesbookingsData.map((booking) => {
      //   const bookingDate = new Date(booking.Date); // Assuming `Date` is in a compatible format
      //   const currentDate = new Date();

      //   // Check if the booking date is in the past and status isn't 'Cancelled'
      //   if (bookingDate < currentDate && booking.Status !== "Cancelled") {
      //     return {
      //       ...booking,
      //       Status: "Completed", // Update status to 'Completed'
      //     };
      //   }

      //   return booking;
      // });

      // Get the current date
      const currentDate = new Date();

      // Update booking statuses if the booking date is in the past
      const updatedBookings = [];

      for (const booking of facilitiesbookingsData) {
        const bookingDate = new Date(booking.Date); // Assuming 'Date' is a valid date string

        // Check if the booking date is in the past and status isn't 'Cancelled'
        if (bookingDate < currentDate.setHours(0, 0, 0, 0) && booking.Status !== "Cancelled") {
          // Update the status to 'Completed'
          const updatedBooking = {
            ...booking,
            Status: "Completed", // Change status to 'Completed'
          };

          // Update the status in Firestore
          await updateDoc(doc(db, "Facilitiesbooking", booking.id), {
            Status: "Completed",
          });

          updatedBookings.push(updatedBooking);
        } else {
          updatedBookings.push(booking);
        }
      }

      setFacilitiesbookings(updatedBookings);

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
      toast.error("Failed to fetch bookings. Please try again.", {
        position: "top-center",
      });
    } finally {
      setLoading(false); // Set loading to false once data is fetched or error occurs
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "Facilitiesbooking", id));
      setFacilitiesbookings(
        facilitiesbookings.filter(
          (facilitiesbooking) => facilitiesbooking.id !== id
        )
      );
      toast.success("Facilities booking successfully deleted!", {
        position: "top-center",
      });
      closeModal();
    } catch (error) {
      console.error("Error deleting facilities booking: ", error);
      toast.error("Failed to delete facilities booking. Please try again.", {
        position: "top-center",
      });
    }
  };

  const openModal = (id) => {
    setDeleteFacilitiesbookingId(id);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setDeleteFacilitiesbookingId(null);
  };

  useEffect(() => {
    fetchFacilitiesbookings();
  }, []);

  const filteredFacilitiesbookings = facilitiesbookings.filter(
    (facilitiesbooking) => {
      const matchesFacilitiesFilter =
        !selectedFacilities ||
        facilitiesbooking.Facility === selectedFacilities; // Apply the selected status filter

      const matchesStatusFilter =
        !selectedStatus || facilitiesbooking.Status === selectedStatus; // Apply the selected status filter

      return matchesFacilitiesFilter && matchesStatusFilter;
    }
  );

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

  // Pagination logic
  const totalPages = Math.ceil(sortedFacilitiesbookings.length / itemsPerPage);
  const indexOfLastBooking = currentPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const currentBookings = sortedFacilitiesbookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container className="mt-4 ">
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

      {/* Search and Add Booking Button */}
      <Row className="mb-4">
        {/* <Col md={8}>
          <Form.Control
            type="text"
            placeholder="Search facilities booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="shadow-sm"
          />
        </Col> */}
        <Col md={5} className="align-items-center mt-sm-3 mt-md-0">
          <Row className=" align-items-center">
            <Col md={4}>
              <Form.Label className="fw-bold">Filter by Facility:</Form.Label>
            </Col>
            <Col md={6}>
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
        <Col md={5} className="align-items-center mt-sm-3 mt-md-0">
          <Row className=" align-items-center">
            <Col md={4}>
              <Form.Label className="fw-bold">Filter by Status:</Form.Label>
            </Col>
            <Col md={6}>
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
        <Col md={2} className="text-md-end mt-3 mt-md-0">
          <Button
            variant="success"
            onClick={() => navigate("/addFacilitiesbooking")}
            className="shadow-sm"
          >
            <FaPlus className="me-2" />
            New Booking
          </Button>
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
          <thead className="table-info">
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
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.length > 0 ? (
              currentBookings.map((facilitiesbooking) => (
                <tr key={facilitiesbooking.id}>
                  <td>{facilitiesbooking.createdAt}</td>
                  {/* <td>
                    {new Date(
                      facilitiesbooking.createdAt.seconds * 1000
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td> */}
                  <td>{facilitiesbooking.Facility}</td>
                  {/* <td>
                    {facilitiesbooking.bookingDate &&
                    facilitiesbooking.bookingDate.seconds
                      ? new Date(
                          facilitiesbooking.bookingDate.seconds * 1000
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Invalid Date"}
                  </td> */}
                  <td>{facilitiesbooking.Date}</td>
                  <td>{formatTimeSlots(facilitiesbooking.TimeSlots)}</td>
                  <td className="text-center">
                    <span className={getStatusBadge(facilitiesbooking.Status)}>
                      {facilitiesbooking.Status || "Pending"}
                    </span>
                  </td>
                  <td className="text-center">
                    {facilitiesbooking.Status === "Upcoming" ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => openModal(facilitiesbooking.id)}
                        className="shadow-sm"
                      >
                        <FaTrash />
                      </Button>
                    ) : (
                      <span className="text-muted">No Actions</span> // Placeholder for non-Upcoming statuses
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No facilities booking found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Pagination Controls */}
      {/* <div className="d-flex justify-content-center my-3">
        <Button
          variant="outline-primary"
          disabled={currentPage === 1}
          onClick={() => paginate(currentPage - 1)}
        >
          Previous
        </Button>
        <div className="mx-2">
          {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline-primary"
          disabled={currentPage === totalPages}
          onClick={() => paginate(currentPage + 1)}
        >
          Next
        </Button>
      </div> */}

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
      {/* Modal for delete confirmation */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Confirm Delete"
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
        <h4 className="mb-3">Confirm Delete</h4>
        <p>Are you sure you want to delete this booking?</p>
        <Button variant="secondary" onClick={closeModal} className="me-2">
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => handleDelete(deleteFacilitiesbookingId)}
        >
          Delete
        </Button>
      </Modal>
    </Container>
  );
}

export default Facilitiesbooking;
