import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
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
} from "react-bootstrap";
import { FaTrash, FaPlus, FaEdit } from "react-icons/fa";
import Modal from "react-modal";

function AdminFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteFacilitiesId, setDeleteFacilitiesId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addFacilityModalOpen, setAddFacilityModalOpen] = useState(false);
  const [editFacilityModalOpen, setEditFacilityModalOpen] = useState(false);
  const [newFacilityTitle, setNewFacilityTitle] = useState("");
  const [editFacilityId, setEditFacilityId] = useState(null);
  const [editFacilityTitle, setEditFacilityTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const facilitiesPerPage = 20;

  const fetchFacilities = async () => {
    try {
      const q = query(
        collection(db, "Facilities"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const facilitiesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFacilities(facilitiesData);
    } catch (error) {
      console.error("Error fetching facilities: ", error);
      toast.error("Failed to load facilities.", {
        position: "top-center",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "Facilities", id));
      setFacilities(facilities.filter((facility) => facility.id !== id));
      toast.success("Facility successfully deleted!", {
        position: "top-center",
      });
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting facility: ", error);
      toast.error("Failed to delete facility. Please try again.", {
        position: "top-center",
      });
    }
  };

  const openDeleteModal = (id) => {
    setDeleteFacilitiesId(id);
    setModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setModalIsOpen(false);
    setDeleteFacilitiesId(null);
  };

  const openAddFacilityModal = () => {
    setAddFacilityModalOpen(true);
  };

  const closeAddFacilityModal = () => {
    setAddFacilityModalOpen(false);
    setNewFacilityTitle("");
  };

  const openEditFacilityModal = (facility) => {
    setEditFacilityId(facility.id);
    setEditFacilityTitle(facility.Title);
    setEditFacilityModalOpen(true);
  };

  const closeEditFacilityModal = () => {
    setEditFacilityModalOpen(false);
    setEditFacilityId(null);
    setEditFacilityTitle("");
  };

  const handleAddFacility = async () => {
    if (!newFacilityTitle.trim()) {
      toast.error("Facility title is required.", {
        position: "top-center",
      });
      return;
    }

    try {
      await addDoc(collection(db, "Facilities"), {
        Title: newFacilityTitle,
        createdAt: new Date(),
      });

      toast.success("Facility added successfully!", {
        position: "top-center",
      });
      fetchFacilities();
      closeAddFacilityModal();
    } catch (error) {
      console.error("Error adding facility: ", error);
      toast.error("Failed to add facility. Please try again.", {
        position: "top-center",
      });
    }
  };

  const handleEditFacility = async () => {
    if (!editFacilityTitle.trim()) {
      toast.error("Facility title is required.", {
        position: "top-center",
      });
      return;
    }

    try {
      const facilityRef = doc(db, "Facilities", editFacilityId);
      await updateDoc(facilityRef, {
        Title: editFacilityTitle,
      });

      toast.success("Facility updated successfully!", {
        position: "top-center",
      });
      fetchFacilities();
      closeEditFacilityModal();
    } catch (error) {
      console.error("Error updating facility: ", error);
      toast.error("Failed to update facility. Please try again.", {
        position: "top-center",
      });
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const filteredFacilities = facilities.filter((facility) =>
    facility.Title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFacilities.length / facilitiesPerPage);

  const paginatedFacilities = filteredFacilities.slice(
    (currentPage - 1) * facilitiesPerPage,
    currentPage * facilitiesPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container className="mt-4">
      <h3
        className="text-center text-black fw-bold py-3 mb-4 bg-warning"
        style={{
          // background: "linear-gradient(45deg,rgb(0, 82, 175),rgb(0, 105, 224))", // Bootstrap primary color
          borderRadius: "15px",
          fontSize: "2.5rem",
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}
      >
        Facilities
      </h3>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Search facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="shadow-sm"
          />
        </Col>
        <Col md={6} className="text-end">
          <Button
            variant="success"
            onClick={openAddFacilityModal}
            className="shadow-sm"
          >
            <FaPlus className="me-2" />
            Add New Facility
          </Button>
        </Col>
      </Row>

      <Table responsive bordered hover className="shadow-sm">
        <thead className="table-secondary text-white">
          <tr>
            <th>Posted On</th>
            <th>Facility</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedFacilities.length > 0 ? (
            paginatedFacilities.map((facility) => (
              <tr key={facility.id}>
                <td>
                  {new Date(
                    facility.createdAt.seconds * 1000
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td>{facility.Title}</td>
                <td className="text-center">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => openEditFacilityModal(facility)}
                    className="shadow-sm me-2"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => openDeleteModal(facility.id)}
                    className="shadow-sm"
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No facilities found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal
        isOpen={addFacilityModalOpen}
        onRequestClose={closeAddFacilityModal}
        contentLabel="Add New Facility"
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
        <h4 className="mb-3">Add New Facility</h4>
        <Form.Group className="mb-3">
          <Form.Label>Facility Title</Form.Label>
          <Form.Control
            type="text"
            value={newFacilityTitle}
            onChange={(e) => setNewFacilityTitle(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleAddFacility} className="me-2">
          Add Facility
        </Button>
        <Button variant="secondary" onClick={closeAddFacilityModal}>
          Cancel
        </Button>
      </Modal>

      <Modal
        isOpen={editFacilityModalOpen}
        onRequestClose={closeEditFacilityModal}
        contentLabel="Edit Facility"
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
        <h4 className="mb-3">Edit Facility</h4>
        <Form.Group className="mb-3">
          <Form.Label>Facility Title</Form.Label>
          <Form.Control
            type="text"
            value={editFacilityTitle}
            onChange={(e) => setEditFacilityTitle(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleEditFacility} className="me-2">
          Save Changes
        </Button>
        <Button variant="secondary" onClick={closeEditFacilityModal}>
          Cancel
        </Button>
      </Modal>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeDeleteModal}
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
        <p>Are you sure you want to delete this facility?</p>
        <Button variant="secondary" onClick={closeDeleteModal} className="me-2">
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => handleDelete(deleteFacilitiesId)}
        >
          Delete
        </Button>
      </Modal>
    </Container>
  );
}

export default AdminFacilities;
