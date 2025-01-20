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
  FaTools,
  FaLightbulb,
  FaChartLine,
} from "react-icons/fa";
import "./navbar.css";
import userImage from "./assets/user-image.png";
import logokk8 from "./assets/logokk8.png";
import adminlogo from "./assets/adminlogo.png";
import Dropdown from "react-bootstrap/Dropdown";
import { Link, useNavigate, useLocation} from "react-router-dom"; // Import Link from react-router-dom

const AdminTopmenu = ({ onLogout }) => {
  const location = useLocation(); // Hook to get the current route
  const [activeTab, setActiveTab] = useState(location.pathname); // Default active tab
  const [userImage, setUserImage] = useState(null); // State to store user image URL
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      //await auth.signOut();
      onLogout();
      navigate("/login");
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
      style={{ backgroundColor: "rgb(255, 252, 205)" }}
      className="fixed-top"
    >
      <Container>
        {/* Logo on the top left */}
        <Navbar.Brand href="/admin-announcement">
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
            backgroundColor: "rgb(255, 230, 0)",
            color: "rgb(255, 230, 0)",
          }}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="justify-content-center w-100 gap-3">
            <Nav.Link
              as={Link}
              to="/admin-announcement"
              onClick={() => handleTabClick("/admin-announcement")}
              style={{
                backgroundColor:
                  activeTab === "/admin-announcement"
                    ? "rgb(255, 234, 46)"
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
                  activeTab === "/admin-announcement"
                    ? "rgb(255, 234, 46)"
                    : "transparent")
              }
            >
              <FaBullhorn className="me-2" /> Announcements
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin-event"
              onClick={() => handleTabClick("/admin-event")}
              style={{
                backgroundColor:
                  activeTab === "/admin-event"
                    ? "rgb(255, 234, 46)"
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
                  activeTab === "/admin-event"
                    ? "rgb(255, 234, 46)"
                    : "transparent")
              }
            >
              <FaRegListAlt className="me-2" /> Events
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin-facilities-booking"
              onClick={() => handleTabClick("/admin-facilities-booking")}
              style={{
                backgroundColor:
                  activeTab === "/admin-facilities-booking"
                    ? "rgb(255, 234, 46)"
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
                  activeTab === "/admin-facilities-booking"
                    ? "rgb(255, 234, 46)"
                    : "transparent")
              }
            >
              <FaCalendarCheck className="me-2" /> Facilities Booking
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin-complaint"
              onClick={() => handleTabClick("/admin-complaint")}
              style={{
                backgroundColor:
                  activeTab === "/admin-complaint"
                    ? "rgb(255, 234, 46)"
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
                  activeTab === "/admin-complaint"
                    ? "rgb(255, 234, 46)"
                    : "transparent")
              }
            >
              <FaPen className="me-2" /> Complaints
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin-facilities"
              onClick={() => handleTabClick("/admin-facilities")}
              style={{
                backgroundColor:
                  activeTab === "/admin-facilities"
                    ? "rgb(255, 234, 46)"
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
                  activeTab === "/admin-facilities"
                    ? "rgb(255, 234, 46)"
                    : "transparent")
              }
            >
              <FaTools className="me-2" /> Facilities
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin-event-suggestions"
              onClick={() => handleTabClick("/admin-event-suggestions")}
              style={{
                backgroundColor:
                  activeTab === "/admin-event-suggestions"
                    ? "rgb(255, 234, 46)"
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
                  activeTab === "/admin-event-suggestions"
                    ? "rgb(255, 234, 46)"
                    : "transparent")
              }
            >
              <FaLightbulb className="me-2" /> Event suggestions
            </Nav.Link>
          </Nav>

          {/* User profile dropdown on the top right */}
          <Nav className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle as="div" id="dropdown-custom-components">
                <img
                  src={adminlogo} // Display placeholder if no image
                  alt="User"
                  width="50"
                  height="50"
                  style={{ borderRadius: "50%", cursor: "pointer" }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {/* <Dropdown.Item href="#profile">Profile</Dropdown.Item> */}
                <Dropdown.Item onClick={handleLogout}>Log Out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminTopmenu;
