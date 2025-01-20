import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
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
import { getAuth } from "firebase/auth";
import "react-quill/dist/quill.snow.css";

function Complaint() {
  const [complaints, setComplaints] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [complaintToCancel, setComplaintToCancel] = useState(null);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [editComplaint, setEditComplaint] = useState({
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
  const [selectedStatus, setSelectedStatus] = useState("");
  const [status, setStatus] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Items per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true); // Set loading to true while fetching
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        console.log(user);
        if (!user) {
          toast.error("You must be logged in to view complaints.", {
            position: "top-center",
          });
          setLoading(false); // Stop loading if user is not logged in
          return;
        }

        const q = query(
          collection(db, "Complaint"),
          where("userId", "==", user.uid) // Filter by userId
        );
        const querySnapshot = await getDocs(q);
        const complaintsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort complaints by createdAt field in descending order
        complaintsData.sort(
          (a, b) => b.createdAt.seconds - a.createdAt.seconds
        );

        setComplaints(complaintsData);

        const uniqueStatus = [
          ...new Set(complaintsData.map((complaint) => complaint.Status)),
        ];
        setStatus(uniqueStatus);
      } catch (error) {
        console.error("Error fetching complaints: ", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchComplaints();
  }, []);

  // Sorting the complaints based on the selected sort order
  const sortedComplaints = [...complaints].sort((a, b) => {
    if (sortOrder === "newest") {
      return b.createdAt.seconds - a.createdAt.seconds; // Newest first
    } else {
      return a.createdAt.seconds - b.createdAt.seconds; // Oldest first
    }
  });

  // Filter complaints by search query and selected date
  const filterByDate = (complaint) => {
    if (!dateFilter || !selectedDate) return true;

    const complaintDate = new Date(complaint.createdAt.seconds * 1000);
    const filterDate = new Date(selectedDate);

    if (dateFilter === "day") {
      return (
        complaintDate.getDate() === filterDate.getDate() &&
        complaintDate.getMonth() === filterDate.getMonth() &&
        complaintDate.getFullYear() === filterDate.getFullYear()
      );
    } else if (dateFilter === "month") {
      return (
        complaintDate.getMonth() === filterDate.getMonth() &&
        complaintDate.getFullYear() === filterDate.getFullYear()
      );
    } else if (dateFilter === "year") {
      return complaintDate.getFullYear() === filterDate.getFullYear();
    }
    return true;
  };

  // Pagination logic
  const filteredComplaints = sortedComplaints.filter((complaint) => {
    const matchesSearchQuery =
      complaint.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.Description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatusFilter =
      !selectedStatus || complaint.Status === selectedStatus;

    return matchesSearchQuery && matchesStatusFilter;
  });

  // Get current page complaints
  const indexOfLastComplaint = currentPage * itemsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - itemsPerPage;
  const currentComplaints = filteredComplaints.slice(
    indexOfFirstComplaint,
    indexOfLastComplaint
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Total pages
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

  // Handle Status update to 'Cancelled'
  const handleCancelComplaint = async () => {
    if (!complaintToCancel) {
      toast.error("No complaint selected for cancellation");
      return;
    }

    try {
      const complaintRef = doc(db, "Complaint", complaintToCancel); // Ensure the collection name matches your Firestore
      await updateDoc(complaintRef, { Status: "Cancelled" });

      // Update the local state to reflect the cancellation
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint.id === complaintToCancel
            ? { ...complaint, Status: "Cancelled" }
            : complaint
        )
      );

      toast.success("Complaint Status updated to 'Cancelled'");
    } catch (error) {
      console.error("Error cancelling complaint:", error);
      toast.error("Failed to update complaint Status");
    } finally {
      handleCloseCancelModal(); // Close the modal
    }
  };

  // Close confirmation modal
  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setComplaintToCancel(null);
  };

  const openEditModal = (complaint) => {
    setEditComplaint(complaint);
    setEditModalIsOpen(true);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    setEditComplaint({ id: "", Title: "", Description: "", File: null });
    setNewFile(null);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    let fileURL = editComplaint.File;

    if (newFile) {
      const fileRef = ref(storage, `complaints/${newFile.name}`);
      try {
        await uploadBytes(fileRef, newFile);
        fileURL = await getDownloadURL(fileRef);
      } catch (uploadError) {
        console.error("Error uploading file: ", uploadError);
        return;
      }
    }

    try {
      await updateDoc(doc(db, "Complaint", editComplaint.id), {
        Title: editComplaint.Title,
        Description: editComplaint.Description,
        File: fileURL,
        updatedAt: new Date(),
      });

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint.id === editComplaint.id
            ? {
                ...complaint,
                Title: editComplaint.Title,
                Description: editComplaint.Description,
                File: fileURL,
              }
            : complaint
        )
      );
      closeEditModal();
    } catch (error) {
      console.error("Error updating complaint: ", error);
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
          background: "linear-gradient(45deg,rgb(52, 7, 110),rgb(79, 0, 182))", // Bootstrap primary color
          borderRadius: "15px",
          fontSize: "2.5rem",
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}
      >
        Complaints
      </h3>
      <Col className="align-items-center mt-sm-3 mt-md-0">
        <Row className=" align-items-center">
          <Col md={5}>
            <Form.Control
              type="text"
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
          </Col>
          <Col md={5} className="align-items-center mt-sm-3 mt-md-0">
            <Row className=" align-items-center">
              <Col md={5}>
                <Form.Label className="fw-bold mb-4">
                  Filter by Status:
                </Form.Label>
              </Col>
              <Col md={7}>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="shadow-sm mb-4"
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
          <Col md={2} className="text-md-end ">
            <Button
              variant="success"
              onClick={() => navigate("/addComplaint")}
              className="shadow-sm mb-4"
            >
              <FaPlus className="me-2" />
              New Complaint
            </Button>
          </Col>
        </Row>
      </Col>

      {/* Loading Indicator */}
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Row className="justify-content-center">
          {currentComplaints.length > 0 ? (
            currentComplaints.map((complaint) => (
              <Col xs={12} key={complaint.id} className="mb-4">
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <Row>
                      <Col xs={12} md={3} className="mb-3 mb-md-0 text-center">
                        <div
                          className="text-white py-3 rounded mx-auto"
                          style={{
                            maxWidth: "200px",
                            backgroundColor: "rgb(79, 0, 182)",
                            color: "#3150b5",
                          }}
                        >
                          <div className="fs-5">
                            {new Date(
                              complaint.createdAt.seconds * 1000
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div>
                            {new Date(
                              complaint.createdAt.seconds * 1000
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} md={9}>
                        <Badge
                          className="mb-3 mx-1"
                          pill
                          bg={
                            complaint.Status === "Pending"
                              ? "danger"
                              : complaint.Status === "Resolved"
                              ? "success"
                              : complaint.Status === "Cancelled"
                              ? "secondary"
                              : "warning" // Default to warning for 'Pending'
                          }
                          style={{ fontSize: "14px" }}
                        >
                          {complaint.Status || "Pending"}
                        </Badge>
                        <Badge
                          className="mb-3 mx-1"
                          pill
                          bg={
                            complaint.Urgency === "High"
                              ? "danger"
                              : complaint.Urgency === "Low"
                              ? "primary"
                              : "warning" // Default to warning for 'Pending'
                          }
                          style={{ fontSize: "14px" }}
                        >
                          {complaint.Urgency || "Pending"}
                        </Badge>

                        <Card.Title
                          className=""
                          style={{
                            color: "rgb(52, 7, 110)",
                            fontWeight: "bold",
                          }}
                        >
                          {complaint.Title.length > 200
                            ? `${complaint.Title.slice(0, 200)}...`
                            : complaint.Title}
                        </Card.Title>
                        {/* </div> */}

                        <div className="justify-content-between align-items-center">
                          <div>
                            {expandedCards[complaint.id] ? (
                              <Card.Text
                                dangerouslySetInnerHTML={{
                                  __html: complaint.Description,
                                }}
                              />
                            ) : (
                              <Card.Text
                                dangerouslySetInnerHTML={{
                                  __html: complaint.Description.slice(0, 0),
                                }}
                              />
                            )}
                          </div>

                          <Button
                            variant="outline-primary"
                            className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 mt-2 text-uppercase fw-bold text-center"
                            onClick={() => toggleExpand(complaint.id)}
                          >
                            {expandedCards[complaint.id] ? (
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
                            {complaint.File && (
                              <a
                                href={complaint.File}
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
                      {complaint.Status === "Pending" && (
                        <>
                          <FaEdit
                            className="text-warning me-3"
                            style={{ cursor: "pointer" }}
                            onClick={() => openEditModal(complaint)}
                          />
                          <FaTrash
                            className="text-danger"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setComplaintToCancel(complaint.id);
                              setShowCancelModal(true);
                            }}
                          />
                        </>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <p className="text-center">No Complaints Found</p>
            </Col>
          )}
        </Row>
      )}

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
      {/* Cancel Confirmation Modal */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to cancel this complaint?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleCancelComplaint}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={editModalIsOpen} onHide={closeEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Complaint</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEdit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editComplaint.Title}
                onChange={(e) =>
                  setEditComplaint({
                    ...editComplaint,
                    Title: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <ReactQuill
                value={editComplaint.Description}
                onChange={(value) =>
                  setEditComplaint({
                    ...editComplaint,
                    Description: value,
                  })
                }
                theme="snow"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Current File</Form.Label>
              {editComplaint.File ? (
                <div>
                  <a
                    href={editComplaint.File}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {editComplaint.File.split("/").pop().split("?")[0]}
                  </a>
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

export default Complaint;
