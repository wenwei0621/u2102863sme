import React from 'react';
import logo from './assets/logo-light-blue.png';
import { auth, db } from "./components/firebase";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/login";
import SignUp from "./components/register";
import Profile from "./components/profile";
import AddEvent from "./components/addEvent";
import Event from "./components/event";

const Sidebar = () => {

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/login";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-dark text-white" style={{ width: '280px', height: '100vh' }}>
      <style jsx="true">{`
        body {
          display: flex;
          flex-direction: row;
        }

        .bg-dark {
          background-color: #1F263E !important;
        }

        .logo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 1rem;
        }

        .nav-link {
          cursor: pointer;
        }
      `}</style>
      <div className="logo-container">
        <img src={logo} alt="Logo" style={{ width: '60px', height: '60px' }} />
      </div>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <a href="/announcement" className="nav-link text-white">
            Announcement
          </a>
        </li>
        <li>
          <a href="/event" className="nav-link text-white">
            Event
          </a>
        </li>
        <li>
          <a href="#" className="nav-link text-white">
            Facilities Booking
          </a>
        </li>
        <li>
          <a href="#" className="nav-link text-white">
            Venue Recommendation
          </a>
        </li>
        <li>
          <a href="#" className="nav-link text-white">
            Complaint
          </a>
        </li>
        <li>
          <a href="#" className="nav-link text-white">
            Feedback
          </a>
        </li>
      </ul>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li>
          <a href="#" className="nav-link text-white">
            Facilities Booking History
          </a>
        </li>
        <li>
          <a href="#" className="nav-link text-white">
            Complaint History
          </a>
        </li>
        <li>
          <a href="#" className="nav-link text-white">
            Feedback History
          </a>
        </li>
      </ul>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
      <li>
        <a href="/profile" className="nav-link text-white">
          Profile
        </a>
        </li>
      </ul>
      <ul className="nav nav-pills flex-column mb-auto">
        <a href="#" className="nav-link text-white" onClick={handleLogout}>
          Log Out
        </a>
      </ul>
    </div>
  );
};

export default Sidebar;
