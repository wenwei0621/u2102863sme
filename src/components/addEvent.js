import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { db, storage } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { FaFileUpload } from "react-icons/fa"; // Import upload icon
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function Event() {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate(); // Initialize navigation function

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let fileURL = "";

    if (file) {
      const fileRef = ref(storage, `events/${file.name}`);
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
      await addDoc(collection(db, "Event"), {
        Title: eventTitle,
        Description: eventDescription,
        File: fileURL,
        createdAt: new Date(),
      });
      setEventTitle("");
      setEventDescription("");
      setFile(null);
      document.getElementById("fileInput").value = ""; // Clear the file input
      toast.success("Event successfully added!", {
        position: "top-center",
      });
      navigate("/admin-event"); // Redirect after successful submission
    } catch (firestoreError) {
      console.error("Error adding document: ", firestoreError);
      toast.error("Event submission failed. Please try again.", {
        position: "top-center",
      });
    }
  };

  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  return (
    <div className="container my-1 d-flex justify-content-center">
      <div
        className="card shadow-lg position-relative"
        style={{ minWidth: "500px", marginTop: "60px" }}
      >
        {/* Close button */}
        <button
          style={{
            backgroundColor: "rgb(255, 255, 255)",
          }}
          onClick={() => navigate("/admin-event")}
          className="btn-close position-absolute top-0 end-0 m-3"
          aria-label="Close"
        ></button>

        <div
          className="card-header text-white text-center"
          style={{
            backgroundColor: "rgb(82, 37, 243)",
          }}
        >
          <h3
            className="mb-1"
            style={{
              backgroundColor: "rgb(82, 37, 243)",
            }}
          >
            Add Event
          </h3>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Event Title</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="form-control"
                placeholder="Enter event title"
                required
              />
            </div>

            {/* <div className="mb-3">
              <label className="form-label">Event Description</label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="form-control"
                placeholder="Enter event description"
                rows="4"
                required
              ></textarea>
            </div> */}

            {/* Description Input */}
            <div className="mb-4">
              <label
                htmlFor="eventDescription"
                className="form-label"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "500",
                }}
              >
                Event Description
              </label>
              <ReactQuill
                value={eventDescription}
                onChange={setEventDescription}
                modules={modules}
                theme="snow"
                style={{
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  // height: "150px",
                  // backgroundColor: "#f9f9f9",
                }}
                placeholder="Provide details about the event"
              />
            </div>

            <div className="mb-3">
              {/* <label className="form-label">Upload File</label> */}
              <div className="input-group">
                {/* <span className="input-group-text">
                  <FaFileUpload />
                </span> */}
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleFileChange}
                  className="form-control"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-3">
              Publish Event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Event;
