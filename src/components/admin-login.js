import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase"; // Import Firestore
import { doc, getDoc } from "firebase/firestore";
import bcrypt from "bcryptjs"; // Install bcryptjs for password hashing comparison
import logo from "../assets/logo-black.png";

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("admin login ing");
    setError("");
    //   if (username === "1" && password === "1") {
    //     onLogin({ username, role: "admin" }); // Pass user data to parent
    //     console.log("Admin logged in Successfully");
    //     // navigate("/admin-announcement");
    //     // alert("Login successful!");
    //     toast.success("User logged in Successfully", {
    //       position: "top-center",
    //     });
    //   } else {
    //     setError("Invalid username or password");
    //   }
    // };

    try {
      // Fetch admin credentials from Firestore
      const adminDoc = await getDoc(doc(db, "Admin", "Admin"));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const isPasswordCorrect = await bcrypt.compare(
          password,
          adminData.password
        );

        if (adminData.username === username && isPasswordCorrect) {
          console.log("credential correct");
          onLogin({ username, role: "admin" }); // Pass user data to parent
          console.log("admin login toast");
          toast.success("Admin logged in successfully", {
            position: "top-center",
          });
          console.log("admin login pass toast");
          navigate("/admin-announcement");
        } else {
          console.log("invalid admin credential");
          setError("Invalid username or password");
        }
      } else {
        setError("Admin account not found");
      }
    } catch (error) {
      console.error("Error fetching admin data: ", error);
      setError("An error occurred. Please try again later.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="p-5"
      // style={{ maxWidth: "400px", marginTop: "100px" }}
      style={{
        background: "linear-gradient(135deg, #faec73, #7087fa)",
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "#ffffff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div className="mb-4">
          <img src={logo} alt="Logo" style={{ width: "120px" }} />
        </div>
        <h3 className="text-center mb-4 ">Admin Login</h3>
        <div className="form-group mb-4">
          <label htmlFor="username" className="form-label text-start d-block">
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(""); // Clear error on change
            }}
            placeholder="Enter username"
          />
        </div>
        <div className="form-group mb-4 form-label text-start d-block">
          <label htmlFor="password">Password</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <div className="input-group-append ">
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </button>
            </div>
          </div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button
          type="submit"
          className="btn w-100"
          style={{
            backgroundColor: "#FFEB3B", // Yellow background color
            borderColor: "#FFEB3B", // Matching border color
            color: "black", // Black text color
            fontWeight: "500",
          }}
        >
          Login
        </button>
        <div className="text-center mt-3">
          <a
            href="login"
            style={{
              color: "#424242",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#6D83F2")} // Change color on hover 6D83F2
            onMouseLeave={(e) => (e.target.style.color = "#424242")} // Revert color when not hovered
          >
            Login as Residence
          </a>
        </div>
      </form>
    </div>
  );
}

export default AdminLogin;
