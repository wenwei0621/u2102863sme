import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import SignInWithGoogle from "./signInWithGoogle";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from '../assets/logo-dark-blue.png';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in Successfully");
      window.location.href = "/profile";
      toast.success("User logged in Successfully", {
        position: "top-center",
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        toast.error("Email doesn't registered", {
          position: "bottom-center",
        });
      } else if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password", {
          position: "bottom-center",
        });
      } else {
        toast.error(error.message, {
          position: "bottom-center",
        });
      }
      console.log(error.message);
    }
  };

  return (
    <div className="p-5" style={{ backgroundColor: '#DEE7FF', padding: '20px', borderRadius: '10px' }}>
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-3">
          <img src={logo} alt="Logo" style={{ width: '100px' }} />
        </div>
        <h3>Login</h3>

        <div className="mb-3">
          <label>Email address</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
              style={{ borderColor: 'white' }} // Change the border color as needed
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
        </div>

        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Log in
          </button>
        </div>
        <p className="forgot-password text-right">
          New user <a href="/register">Register Here</a>
        </p>
        <SignInWithGoogle/>
      </form>
    </div>
  );
}

export default Login;
