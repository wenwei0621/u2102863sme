import React, { useState } from "react";
import { db, storage } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function AddAnnouncement() {
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementDescription, setAnnouncementDescription] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let fileURL = "";

    if (file) {
      const fileRef = ref(storage, `announcements/${file.name}`);
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
      await addDoc(collection(db, "Announcement"), {
        Title: announcementTitle,
        Description: announcementDescription,
        File: fileURL,
        createdAt: new Date(),
      });
      setAnnouncementTitle("");
      setAnnouncementDescription("");
      setFile(null);
      setFileName("");
      document.getElementById("fileInput").value = ""; // Clear the file input
      toast.success("Announcement successfully added!", {
        position: "top-center",
      });
      navigate("/admin-announcement"); // Redirect after successful submission
    } catch (firestoreError) {
      console.error("Error adding document: ", firestoreError);
      toast.error("Announcement submission failed. Please try again.", {
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
    <div className="mx-3 my-1 d-flex justify-content-center">
      <div
        className="card shadow-lg position-relative"
        style={{ width: "500px", minHeight: "450px", marginTop: "70px" }}
      >
        <button
          style={{
             backgroundColor: "rgb(255, 255, 255)",
          }}
          onClick={() => navigate("/admin-announcement")}
          className="btn-close position-absolute top-0 end-0 m-3 "
          aria-label="Close"
        ></button>

        <div
          className="card-header text-white text-center"
          style={{
            backgroundColor: "rgb(0, 82, 175)",
          }}
        >
          <h3
            className="mb-1"
            style={{
              backgroundColor: "rgb(0, 82, 175)",
            }}
          >
            Create a New Announcement
          </h3>
        </div>

        <form className="px-3" onSubmit={handleSubmit}>
          {/* Title Input */}
          <div className="my-3">
            <label
              htmlFor="announcementTitle"
              className="form-label"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "500",
              }}
            >
              Announcement Title
            </label>
            <input
              id="announcementTitle"
              type="text"
              className="form-control shadow-sm"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              placeholder="Enter the announcement title"
              required
              style={{
                borderRadius: "8px",
                padding: "10px",
                border: "1px solid #ddd",
                transition: "all 0.2s",
              }}
              onFocus={(e) => (e.target.style.border = "1px solid #007bff")}
              onBlur={(e) => (e.target.style.border = "1px solid #ddd")}
            />
          </div>

          {/* Description Input */}
          <div className="mb-4">
            <label
              htmlFor="announcementDescription"
              className="form-label"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "500",
              }}
            >
              Announcement Description
            </label>
            <ReactQuill
              value={announcementDescription}
              onChange={setAnnouncementDescription}
              modules={modules}
              theme="snow"
              style={{
                borderRadius: "8px",
                border: "1px solid #ddd",
                // height: "150px",
                // backgroundColor: "#f9f9f9",
              }}
              placeholder="Provide details about the announcement"
            />
          </div>

          {/* File Upload */}
          <div className="mb-4">
            {/* <label
              htmlFor="fileInput"
              className="form-label"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "500",
              }}
            > */}
              {/* Attach File (Optional) */}
            {/* </label> */}
            <input
              id="fileInput"
              type="file"
              className="form-control"
              onChange={handleFileChange}
              // style={{
              //   borderRadius: "8px",
              //   padding: "10px",
              //   border: "1px solid #ddd",
              // }}
            />
            {/* {fileName && (
              <small className="text-muted d-block mt-2">
                Selected File:{" "}
                <span className="fw-bold" style={{ color: "#007bff" }}>
                  {fileName}
                </span>
              </small>
            )} */}
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="btn btn-primary btn-lg px-5 mb-3"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "bold",
                transition: "background-color 0.3s",
              }}
            >
              Publish Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAnnouncement;
