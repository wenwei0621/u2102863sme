import React, { useState, useEffect } from "react";
import { db, storage } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import { getAuth } from "firebase/auth";

function AddFacilitiesBooking() {
  const [formData, setFormData] = useState({
    Facility: "",
    Date: "",
    TimeSlots: [], // Allow up to 2 time slots
    Status: "Upcoming",
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Facilities"));
        const facilitiesList = querySnapshot.docs.map(
          (doc) => doc.data().Title
        ); // Assuming your document has a `name` field
        setFacilities(facilitiesList);
        console.log(facilitiesList);
      } catch (error) {
        console.error("Error fetching facilities: ", error);
      }
    };

    fetchFacilities();
    setTimeSlots(generateTimeSlots()); // Generate time slots
  }, []);

  useEffect(() => {
    if (formData.Facility && formData.Date) {
      const q = query(
        collection(db, "Facilitiesbooking"),
        where("Facility", "==", formData.Facility),
        where("Date", "==", formData.Date)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const booked = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const bookingDate = data.bookingDate.toDate(); // Convert Firestore Timestamp to JavaScript Date
          return {
            ...data,
            bookingDate, // Now `bookingDate` is a JavaScript Date object
          };
        });
        setBookedSlots(booked.flatMap((booking) => booking.TimeSlots));
      });

      return () => unsubscribe();
    } else {
      setBookedSlots([]);
    }
  }, [formData.Facilities, formData.Date]);

  const generateTimeSlots = () => {
    const slots = [];
    let startTime = 8;
    let endTime = 20;
    while (startTime < endTime) {
      const nextHour = startTime + 1;
      slots.push(`${formatTime(startTime)} - ${formatTime(nextHour)}`);
      startTime = nextHour;
    }
    return slots;
  };

  const formatTime = (hour) => {
    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:00 ${suffix}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "TimeSlots") {
      const updatedSlots = [...formData.TimeSlots];

      if (updatedSlots.includes(value)) {
        // Remove the slot if already selected
        setFormData((prevData) => ({
          ...prevData,
          TimeSlots: updatedSlots.filter((slot) => slot !== value),
        }));
      } else if (updatedSlots.length < 2) {
        // Add the slot if less than 2 are selected
        setFormData((prevData) => ({
          ...prevData,
          TimeSlots: [...updatedSlots, value],
        }));
      } else {
        toast.error("You can only select up to 2 time slots.", {
          position: "top-center",
        });
      }
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleClearSelection = () => {
    setFormData((prevData) => ({
      ...prevData,
      TimeSlots: [],
    }));
    // toast.info("Time slot selection cleared.", { position: "top-center" });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast.error("You must be logged in to make a booking.", {
        position: "top-center",
      });
      setIsSubmitting(false);
      return;
    }

    if (formData.TimeSlots.some((slot) => bookedSlots.includes(slot))) {
      toast.error("One or more selected time slots are already booked.", {
        position: "top-center",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // If you want to save the booking date as a Date object
      const bookingDate = new Date(formData.Date);

      let fileURL = null;
      if (file) {
        const fileRef = ref(storage, `facilitiesbookings/${file.name}`);
        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
      }
      console.log(user);

      await addDoc(collection(db, "Facilitiesbooking"), {
        ...formData,
        // File: fileURL,
        bookingDate: bookingDate, // Add bookingDate here
        createdAt: today,
        userId: user.uid,
        userEmail: user.email, // Add user's email here
        // userContactNo: user.contactNo,
        // userName: user.name,
      });

      toast.success("Facilities booking added successfully!", {
        position: "top-center",
      });
      navigate("/facilities-booking");
    } catch (error) {
      console.error("Error adding facilities booking: ", error);
      toast.error("Failed to add facilities booking. Please try again.", {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-2 my-2 d-flex justify-content-center">
      <div
        className="card shadow-lg position-relative"
        style={{ width: "500px", minHeight: "450px", marginTop: "80px" }}
      >
        {/* Close button */}
        <button
          style={{
            backgroundColor: "rgb(255, 255, 255)",
          }}
          onClick={() => navigate("/facilities-booking")}
          className="btn-close position-absolute top-0 end-0 m-3"
          aria-label="Close"
        ></button>
        {/* <div className="mt-4" style={{ padding: "20px" }}> */}
        <div
          className="card-header text-white text-center"
          style={{
            backgroundColor: "rgb(0, 82, 175)",
          }}
        >
          <h3
            className="mb-1"
            // className="text-center text-white fw-bold py-3 mb-4"
            style={{
              backgroundColor: "rgb(0, 82, 175)",
            }}
          >
            Add Facilities Booking
          </h3>
        </div>

        <Form
          onSubmit={handleSubmit}
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <Form.Group className="my-4">
            <Form.Label>Facility</Form.Label>
            <Form.Select
              name="Facility"
              value={formData.Facility}
              onChange={handleChange}
              required
            >
              <option value="">Select a facility</option>
              {facilities.map((facilities, index) => (
                <option key={index} value={facilities}>
                  {facilities}
                </option>
              ))}
            </Form.Select>

            {/* <Form.Select
            name="Facility"
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            required
          >
            <option value="">Select a facility</option>
            {facility.map((facility, index) => (
              <option key={index} value={facility}>
                {facility}
              </option>
            ))}
          </Form.Select> */}
          </Form.Group>

          <Form.Group className="my-4">
            <Form.Label>Booking Date</Form.Label>
            <Form.Control
              type="date"
              name="Date"
              value={formData.Date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]} // Today's date in YYYY-MM-DD format
              max={
                new Date(new Date().setDate(new Date().getDate() + 14))
                  .toISOString()
                  .split("T")[0]
              } // Two weeks from today in YYYY-MM-DD format
            />
          </Form.Group>

          <Form.Group className="my-4">
            <Form.Label>Time Slots</Form.Label>
            <Form.Select
              name="TimeSlots"
              value={formData.TimeSlots[formData.TimeSlots.length - 1] || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select a time slot</option>
              {timeSlots.map((slot, index) => (
                <option
                  key={index}
                  value={slot}
                  disabled={
                    bookedSlots.includes(slot) ||
                    formData.TimeSlots.includes(slot)
                  }
                >
                  {slot} {bookedSlots.includes(slot) ? "(Booked)" : ""}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Selected Slots: {formData.TimeSlots.join(", ") || "None"}
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-between ">
            <Button
              variant="warning"
              onClick={handleClearSelection}
              className="mx-5"
            >
              Clear Selection
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="mx-5"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
            {/* <Button
              className="mx-4"
              variant="secondary"
              onClick={() => navigate("/facilities-booking")}
            >
              Cancel
            </Button> */}
          </div>
        </Form>
      </div>
    </div>
  );
}

export default AddFacilitiesBooking;
