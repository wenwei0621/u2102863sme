import React, { useState, useEffect } from "react";
import logo from "./assets/logo-dark-blue.png";
import { auth, db } from "./components/firebase";
import { doc, getDoc } from "firebase/firestore";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import {
  FaBullhorn,
  FaRegListAlt,
  FaCalendarCheck,
  FaPen,
  FaChartLine,
} from "react-icons/fa";
import "./navbar.css";
import userImage from "./assets/user-image.png";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Link, useLocation } from "react-router-dom"; // Import Link from react-router-dom

const Topmenu = () => {
  const location = useLocation(); // Hook to get the current route
  const [activeTab, setActiveTab] = useState(location.pathname); // Default active tab
  const [userImage, setUserImage] = useState(null); // State to store user image URL
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/login";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab); // Set active tab on click
  };

  // Fetch user image URL from database
  useEffect(() => {
    const fetchUserImage = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "Users", user.uid); // Adjust collection path as needed
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserImage(docSnap.data().photoURL); // Assuming 'photoURL' is the field name in Firestore
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user image:", error);
        }
      }
    };

    fetchUserImage();
  }, []);

  return (
    <Navbar
      variant="dark"
      expand="lg"
      style={{ backgroundColor: "#e3e8ff" }}
      className="fixed-top"
    >
      <Container>
        {/* Logo on the top left */}
        <Navbar.Brand href="/announcement">
          <img
            src={logo}
            alt="Logo"
            width="50" // Adjust width as needed
            height="50" // Adjust height as needed
            className="d-inline-block align-top"
          />
        </Navbar.Brand>

        {/* Toggle button for mobile view */}
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          style={{
            backgroundColor: "#3150b5",
            color: "#3150b5"
          }}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="justify-content-center w-100 gap-3">
            <Nav.Link
              as={Link}
              to="/announcement"
              onClick={() => handleTabClick("/announcement")}
              style={{
                backgroundColor:
                  activeTab === "/announcement" ? "#a8bdff" : "transparent",
                borderRadius: "8px",
                padding: "10px 15px",
                color: "#1d3557",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#cfcfcf")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  activeTab === "/announcement" ? "#a8bdff" : "transparent")
              }
            >
              <FaBullhorn className="me-2" /> Announcements
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/event"
              onClick={() => handleTabClick("/event")}
              style={{
                backgroundColor:
                  activeTab === "/event" ? "#a8bdff" : "transparent",
                borderRadius: "8px",
                padding: "10px 15px",
                color: "#1d3557",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#cfcfcf")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  activeTab === "/event" ? "#a8bdff" : "transparent")
              }
            >
              <FaRegListAlt className="me-2" /> Events
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/facilities-booking"
              onClick={() => handleTabClick("/facilities-booking")}
              style={{
                backgroundColor:
                  activeTab === "/facilities-booking"
                    ? "#a8bdff"
                    : "transparent",
                borderRadius: "8px",
                padding: "10px 15px",
                color: "#1d3557",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#cfcfcf")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  activeTab === "/facilities-booking"
                    ? "#a8bdff"
                    : "transparent")
              }
            >
              <FaCalendarCheck className="me-2" /> Facilities Booking
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/complaint"
              onClick={() => handleTabClick("/complaint")}
              style={{
                backgroundColor:
                  activeTab === "/complaint" ? "#a8bdff" : "transparent",
                borderRadius: "8px",
                padding: "10px 15px",
                color: "#1d3557",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#cfcfcf")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  activeTab === "/complaint" ? "#a8bdff" : "transparent")
              }
            >
              <FaPen className="me-2" /> Complaints
            </Nav.Link>
            {/* <Nav.Link
              as={Link}
              to="/statistic"
              onClick={() => handleTabClick("/statistic")}
              style={{
                backgroundColor:
                  activeTab === "/statistic" ? "#a8bdff" : "transparent",
                borderRadius: "8px",
                padding: "10px 15px",
                color: "#1d3557",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#cfcfcf")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  activeTab === "/statistic" ? "#a8bdff" : "transparent")
              }
            >
              <FaChartLine className="me-2" /> Statistic
            </Nav.Link> */}
          </Nav>

          {/* User profile dropdown on the top right */}
          <Nav className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle as="div" id="dropdown-custom-components">
                <img
                  src={userImage || "https://via.placeholder.com/50"} // Display placeholder if no image
                  alt="User"
                  width="50"
                  height="50"
                  style={{ borderRadius: "50%", cursor: "pointer" }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                <Dropdown.Item onClick={() => setShowLogoutModal(true)}>
                  Log Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
      <Modal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to log out?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Log Out
          </Button>
        </Modal.Footer>
      </Modal>
    </Navbar>
  );
};

export default Topmenu;
