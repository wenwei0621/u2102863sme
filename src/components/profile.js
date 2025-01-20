import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Container } from "react-bootstrap";

const storage = getStorage();

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // New state to toggle editing mode

  const fetchUserData = async (user) => {
    console.log("in profile page");
    try {
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Extract matricNo from the email (before '@')
        const matricNo = data.email.split("@")[0];
        setUserDetails({ ...data, matricNo });
        console.log("get user info");
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        await fetchUserData(user);
      } else {
        console.log("User is not logged in");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUpdate = async () => {
    // Validation for empty fields
    if (!userDetails.name || !userDetails.contactNo) {
      toast.error("Name and Contact Number cannot be empty.", {
        position: "top-center",
      });
      return; // Exit the function if validation fails
    }

    // Check if contact number length is less than 10
    if (userDetails.contactNo.length < 10) {
      toast.error("Contact Number must be at least 10 digits.", {
        position: "top-center",
      });
      return; // Exit the function if validation fails
    }
    if (user && userDetails) {
      const docRef = doc(db, "Users", user.uid);
      try {
        // Update Firestore with the profile details and matricNo (auto-derived from email)
        await updateDoc(docRef, {
          name: userDetails.name,
          contactNo: userDetails.contactNo,
          photoURL: userDetails.photoURL ? userDetails.photoURL : "",
          matricNo: userDetails.matricNo, // Make sure matricNo is updated
        });
        toast.success("Profile successfully updated!", {
          position: "top-center",
        });
        console.log("Profile successfully updated!");
        setIsEditing(false); // Exit editing mode after saving
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `Users/${user.uid}/profile.jpg`);
    try {
      await uploadBytes(storageRef, file);
      const imageURL = await getDownloadURL(storageRef);
      setUserDetails({ ...userDetails, photoURL: imageURL });

      // Update the photoURL in the Firestore database
      const docRef = doc(db, "Users", user.uid);
      await updateDoc(docRef, { photoURL: imageURL });
      toast.success("Profile image updated!", { position: "top-center" });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Restrict name input to alphabets only
  const handleNameKeyPress = (e) => {
    const regex = /^[A-Za-z]+$/;
    if (!regex.test(e.key)) {
      e.preventDefault();
    }
  };

  // Restrict contact number input to numbers only
  const handleContactNoKeyPress = (e) => {
    const regex = /^[0-9]+$/;
    if (!regex.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="d-flex  justify-content-center py-4">
      <div
        className="p-5 border rounded-4 shadow-sm mt-3"
        style={{
          backgroundColor: "rgb(246, 248, 255)",
          width: "95%", // Full width by default
          maxWidth: "650px", // Maximum width for larger screens
        }}
      >
        {userDetails ? (
          <>
            {/* Profile Image */}
            <div className="text-center mb-4">
              {/* <img
                src={userDetails.photoURL || "https://via.placeholder.com/150"}
                alt="Profile"
                className="rounded-circle img-fluid"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              /> */}
              <img
                src={userDetails.photoURL || "https://via.placeholder.com/150"}
                alt="Profile"
                className="rounded-circle img-fluid"
                style={{
                  width: "100%",
                  maxWidth: "150px", // Limits the size on larger screens
                  aspectRatio: "1", // Ensures a perfect square
                  objectFit: "cover",
                }}
              />

              {isEditing && (
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              )}
            </div>

            <div>
              <div className="mb-3 text-start">
                <p>Name:</p>
                <input
                  style={{ textAlign: "center" }}
                  name="name"
                  className="form-control "
                  value={userDetails.name}
                  maxLength="40"
                  onChange={handleChange}
                  onKeyPress={(e) => {
                    const regex = /^[a-zA-Z\s]*$/; // Only alphabets and spaces allowed
                    if (!regex.test(e.key)) {
                      e.preventDefault(); // Prevent invalid input
                    }
                  }}
                  disabled={!isEditing} // Enabled only in edit mode
                />
              </div>
              <div className="mb-3 text-start">
                <p>Matric No:</p>
                <input
                  style={{ textAlign: "center" }}
                  name="matricNo"
                  className="form-control"
                  value={userDetails.matricNo}
                  maxLength="15"
                  disabled // Disabled so that the user can't edit it
                />
              </div>
              <div className="mb-3 text-start">
                <p>Contact Number:</p>
                <input
                  style={{
                    textAlign: "center",
                    "::placeholder": {
                      color: "#dcdcdc", // Very light grey color
                      opacity: "0.5", // Ensures visibility across browsers
                    },
                  }}
                  name="contactNo"
                  className="form-control"
                  value={userDetails.contactNo}
                  minLength="10"
                  maxLength="11"
                  pattern="^\d{11}$"
                  placeholder="e.g. 01123456789" // Guide for the user
                  onChange={handleChange}
                  onKeyPress={handleContactNoKeyPress} // Restrict to numbers only
                  disabled={!isEditing} // Enabled only in edit mode
                />
              </div>
              <div className="mb-3 text-start">
                <p>Email:</p>
                <input
                  style={{ textAlign: "center" }}
                  className="form-control"
                  name="email"
                  value={userDetails.email}
                  disabled
                />
              </div>
            </div>
            {/* Show Save button only in edit mode */}
            {isEditing ? (
              <button
                className="mt-3 btn btn-secondary"
                style={{ backgroundColor: "#507afa" }}
                onClick={handleUpdate}
              >
                Save
              </button>
            ) : (
              <button
                className="mt-3 btn btn-secondary"
                onClick={() => setIsEditing(true)} // Enable editing on click
                style={{ backgroundColor: "#507afa" }}
              >
                Edit Profile
              </button>
            )}
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
