import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import SignInWithGoogle from "./signInWithGoogle";
import logo from "../assets/logo-dark-blue.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [backgroundSize, setBackgroundSize] = useState("1106px 652px");

  useEffect(() => {
    function handleResize() {
      // Define the breakpoint for screen resizing
      if (window.innerWidth < 768) {
        setBackgroundSize("651px 384px");
      } else {
        setBackgroundSize("1106px 652px");
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on component mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      if (error.code === "auth/user-not-found") {
        toast.error("Email doesn't registered", {
          position: "bottom-center",
        });
        // } else if (error.code === "auth/wrong-password") {
        //   toast.error("Incorrect password", {
        //     position: "bottom-center",
        //   });
      } else {
        toast.error(error.message, {
          position: "bottom-center",
        });
      }
      console.log(error.message);
    }
  };

  return (
    <div
      className="p-5"
      style={{
        background: "linear-gradient(135deg, #7087fa, #faec73)",
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
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
        <div className="mb-4">
          <h3 style={{ color: "#333", fontWeight: "bold" }}>Welcome Back!</h3>
          <p style={{ color: "#555", fontSize: "14px" }}>
            Your Gateway to Updates at KK8!
          </p>
          <p style={{ color: "#ff2d55", fontSize: "14px", marginTop: "10px" }}>
            Please use your siswamail to sign in
          </p>
        </div>

        <SignInWithGoogle />

        <div className="text-center mt-4">
          <a
            href="admin-login"
            style={{
              color: "#0a24a6",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#F9A825")} // Change color on hover
            onMouseLeave={(e) => (e.target.style.color = "#0a24a6")} // Revert color when not hovered

          >
            Login as Admin
          </a>
        </div>
      </form>
    </div>
  );
}
export default Login;
