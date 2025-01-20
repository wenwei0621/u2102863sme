import React, { useState } from "react";
import { db, storage } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap styles
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { getAuth } from "firebase/auth";

function AddComplaint() {
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintUrgency, setComplaintUrgency] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const urgency = ["High", "Medium", "Low"];

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast.error("You must be logged in to make a complaint.", {
        position: "top-center",
      });
      setIsSubmitting(false);
      return;
    }
    let fileURL = "";

    if (file) {
      const fileRef = ref(storage, `complaints/${file.name}`);
      try {
        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
      } catch (uploadError) {
        console.error("Error uploading file: ", uploadError);
        toast.error("File upload failed. Please try again.", {
          position: "top-center",
        });
        return;
      }
    }

    try {
      console.log(user);
      await addDoc(collection(db, "Complaint"), {
        Title: complaintTitle,
        Description: complaintDescription,
        Urgency: complaintUrgency,
        File: fileURL,
        createdAt: new Date(),
        Status: "Pending",
        userId: user.uid,
        userEmail: user.email,
      });
      setComplaintTitle("");
      setComplaintDescription("");
      setComplaintUrgency("");
      setFile(null);
      document.getElementById("fileInput").value = ""; // Clear the file input
      toast.success("Complaint successfully added!", {
        position: "top-center",
      });
      navigate("/complaint");
    } catch (firestoreError) {
      console.error("Error adding document: ", firestoreError);
      toast.error("Complaint submission failed. Please try again.", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="my-5 d-flex justify-content-center">
      <form
        className="card shadow-sm"
        style={{ width: "500px", minHeight: "450px" }}
        onSubmit={handleSubmit}
      >
        <button
          style={{
            backgroundColor: "rgb(255, 255, 255)",
          }}
          onClick={() => navigate("/complaint")}
          className="btn-close position-absolute top-0 end-0 m-3"
          aria-label="Close"
        ></button>
        <div
          className="card-header text-white text-center"
          style={{
            backgroundColor: "rgb(79, 0, 182)",
          }}
        >
          <h1
            className="text-center mb-2"
            style={{
              backgroundColor: "rgb(79, 0, 182)",
            }}
          >
            New Complaint
          </h1>
        </div>
        <p
          className="text-left mt-1"
          style={{
            color: "rgb(182, 0, 0)",
          }}
        >
          *General issue pls raise ticket at um helpdesk e.g. light is broken
        </p>
        <div className=" mx-1  p-3">
          <div className="mb-3 p-0">
            <label className="form-label">Complaint Title</label>
            <input
              type="text"
              className="form-control"
              value={complaintTitle}
              onChange={(e) => setComplaintTitle(e.target.value)}
              placeholder="Enter complaint title"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Complaint Description</label>
            <textarea
              className="form-control"
              value={complaintDescription}
              onChange={(e) => setComplaintDescription(e.target.value)}
              placeholder="Describe your complaint"
              rows="5"
              required
            ></textarea>
          </div>

          <div className="mb-3 p-2">
            <label className="form-label">Urgency Level</label>
            <select
              className="form-select"
              value={complaintUrgency}
              onChange={(e) => setComplaintUrgency(e.target.value)}
              required
            >
              <option value="" disabled>
                Select an urgency level
              </option>
              {urgency.map((urgency, index) => (
                <option key={index} value={urgency}>
                  {urgency}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3 p-2">
            <label className="form-label">Upload File (Optional)</label>
            <input
              type="file"
              className="form-control"
              id="fileInput"
              onChange={handleFileChange}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-2">
            Submit Complaint
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddComplaint;
