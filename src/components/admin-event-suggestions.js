import React, { useState } from "react";
import axios from "axios";

function AdminEventSuggestions() {
  const [formData, setFormData] = useState({
    Category: "",
    Duration: "",
    TargetParticipants: "",
    SDG: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateInputs = () => {
    const selectedKeys = Object.keys(formData).filter(
      (key) => formData[key] !== ""
    );
    return selectedKeys.length > 1; // Ensure at least 2 features are selected
  };

  const fetchSuggestions = async () => {
    if (!validateInputs()) {
      setError("Please select at least 2 features before proceeding.");
      return;
    }

    setIsLoading(true); // Start loading
    setError(""); // Clear previous errors

    console.log("Error: ", error);
    try {
      const response = await axios.post("http://127.0.0.1:5000/recommend", {
        Category: formData.Category,
        Duration: formData.Duration,
        Participants: formData.TargetParticipants,
        SDG: formData.SDG,
      });
      setSuggestions(response.data);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to fetch suggestions. Please check your inputs or try again later."
      );
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div className="container mt-4">
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
        Event Suggestions
      </h3>
      <div className="row">
        <div className="col-md-6 mx-auto">
          <div className="card p-4 shadow-sm rounded">
            <form>
              <div className="mb-3">
                <label htmlFor="Category" className="form-label">
                  Category
                </label>
                <select
                  className="form-select"
                  id="Category"
                  name="Category"
                  value={formData.Category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option value="Arts and Creativity">
                    Arts and Creativity
                  </option>
                  <option value="Community Engagement">
                    Community Engagement
                  </option>
                  <option value="Culinary Arts">Culinary Arts</option>
                  <option value="Cultural Exchange">Cultural Exchange</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Environmental Awareness">
                    Environmental Awareness
                  </option>
                  <option value="Health and Well-being">
                    Health and Well-being
                  </option>
                  <option value="Innovation and Technology">
                    Innovation and Technology
                  </option>
                  <option value="Sports and Recreation">
                    Sports and Recreation
                  </option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="Duration" className="form-label">
                  Duration
                </label>
                <select
                  className="form-select"
                  id="Duration"
                  name="Duration"
                  value={formData.Duration}
                  onChange={handleChange}
                >
                  <option value="">Select Duration</option>
                  <option value="1 hour">1 hour</option>
                  <option value="2-3 hours">2-3 hours</option>
                  <option value="Half day">Half day</option>
                  <option value="Full day">Full day</option>
                  <option value="1 week">1 week</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="TargetParticipants" className="form-label mt-1">
                  Target Number of Participants
                </label>
                <select
                  className="form-select mt-1"
                  id="TargetParticipants"
                  name="TargetParticipants"
                  value={formData.TargetParticipants}
                  onChange={handleChange}
                >
                  <option value="">Select Target Number of Participants</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="40">40</option>
                  <option value="80">80</option>
                  <option value="150">150</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="SDG" className="form-label">
                  Sustainable Development Goals
                </label>
                <select
                  className="form-select"
                  id="SDG"
                  name="SDG"
                  value={formData.SDG}
                  onChange={handleChange}
                >
                  <option value="">Select SDG</option>
                  <option value="Climate Action">Climate Action</option>
                  <option value="Good Health and Well-being">
                    Good Health and Well-being
                  </option>
                  <option value="Industry, Innovation, and Infrastructure">
                    Industry, Innovation, and Infrastructure
                  </option>
                  <option value="Partnerships for the Goals">
                    Partnerships for the Goals
                  </option>
                  <option value="Quality Education">Quality Education</option>
                  <option value="Reduced Inequalities">
                    Reduced Inequalities
                  </option>
                  <option value="Sustainable Cities and Communities">
                    Sustainable Cities and Communities
                  </option>
                </select>
              </div>
              <button
                type="button"
                className="btn btn-primary w-100 mt-3"
                onClick={fetchSuggestions}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : (
                  "Get Suggestions"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger mt-4">{error}</div>}

      <div className="mt-5">
        <h2 className="text-center text-success mb-3">Suggestions</h2>
        <div className="row">
          {suggestions.map((event, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <h5 className="card-title text-primary">
                    {event.Activity || `Event ${index + 1}`}
                  </h5>
                  <p className="card-text">
                    <strong>Category:</strong> {event.Category}
                    <br />
                    <strong>Duration:</strong> {event.Duration}
                    <br />
                    <strong>Number of Participants:</strong>{" "}
                    {event.Participants}
                    <br />
                    <strong>SDG:</strong> {event.SDG}
                    <br />
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminEventSuggestions;
