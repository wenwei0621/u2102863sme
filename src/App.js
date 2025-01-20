import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Topmenu from "./navbar";
import AdminTopmenu from "./admin-navbar";
import Login from "./components/login";
import AdminLogin from "./components/admin-login";
import SignUp from "./components/register";
import Profile from "./components/profile";
import AddEvent from "./components/addEvent";
import Event from "./components/event";
import AddAnnouncement from "./components/addAnnouncement";
import Announcement from "./components/announcement";
import AdminAnnouncement from "./components/admin-announcement";
import Facilitiesbooking from "./components/facilities-booking";
import AddFacilitiesbooking from "./components/addFacilitiesbooking";
import Complaint from "./components/complaint";
import AddComplaint from "./components/addComplaint";
import Statistic from "./components/statistic";
import AdminEvent from "./components/admin-event";
import AdminFacilitiesbooking from "./components/admin-facilities-booking";
import AdminComplaint from "./components/admin-complaint";
import AdminFacilities from "./components/admin-facilities";
import AdminEventSuggestions from "./components/admin-event-suggestions";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "./components/firebase";
import {
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import { AuthProvider, useAuth } from "./components/AuthContext";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [isAdmin, setIsAdmin] = useState(false);
  const { isAdmin, handleAdmin, logoutAdmin } = useAuth();

  useEffect(() => {
    // console.log("sssas", localStorage.getItem("role"));
    // if (localStorage.getItem("role") === "admin") {
    //   console.log("sdasda");
    //   setIsAdmin(true);
    // }
    console.log(isAdmin);
    console.log(user);

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        // Fetch role from custom claims or localStorage
        // const token = await user.getIdTokenResult();
        // setIsAdmin(token.claims.role === "admin");
      }
      // } else {
      //   setUser(null);
      //   setIsAdmin(false);
      // }
      setLoading(false);
    });
    console.log("sssas", isAdmin);
    return unsubscribe;
  }, []);

  // useEffect(() => {
  //   const fetch = async () => {
  //     console.log("sssas", localStorage.getItem("role"));
  //     if (localStorage.getItem("role") === "admin") {
  //       console.log("ccxcxsdasda");
  //       setIsAdmin(true);
  //     }
  //   };

  //   fetch();
  // }, []);

  // // Check if user role is in the Firebase token claims
  // const getRoleFromFirebase = async (authUser) => {
  //   const token = await authUser.getIdTokenResult();
  //   return token.claims.role || "user"; // Default to 'user' if role not found
  // };

  //   // Set Firebase persistence to localStorage (browserLocalPersistence)
  //   useEffect(() => {
  //     setPersistence(auth, browserLocalPersistence)
  //       .then(() => {
  //         // Start listening for auth state changes
  //         const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
  //           if (authUser) {
  //             // User is logged in
  //             setUser(authUser);
  //             const role = await getRoleFromFirebase(authUser); // Get the role from Firebase token
  //             setIsAdmin(role === "admin"); // Set admin status
  //             localStorage.setItem("role", role);  // Store role in localStorage
  //             localStorage.setItem("username", authUser.displayName || authUser.email);  // Store username in localStorage
  //           } else {
  //             // User is logged out
  //             setUser(null);
  //             setIsAdmin(false);
  //             localStorage.removeItem("role");  // Clear role from localStorage
  //             localStorage.removeItem("username"); // Clear username from localStorage
  //           }
  //           setLoading(false);
  //         });

  //         // Cleanup listener when component unmounts
  //         return unsubscribe;
  //       })
  //       .catch((error) => {
  //         console.error("Error setting persistence: ", error);
  //       });
  //   }, []);  // Empty dependency array to only run on mount

  // const handleLogout = () => {
  //   console.log("logout");
  //   auth.signOut();
  //   setUser(null);
  //   setIsAdmin(false);
  //   localStorage.removeItem("role");
  // };

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        setUser(null);
        // setIsAdmin(false);
        logoutAdmin();
      })
      .catch((error) => {
        console.error("Error during logout: ", error);
      });
  };

  const handleAdminLogin = (userData) => {
    setUser(userData);
    handleAdmin(userData);
  };

  // const handleAdminLogin = (userData) => {
  //   console.log("Admin logged in: ", userData);
  //   setUser(userData);
  //   localStorage.setItem("role", "admin"); // Persist admin role
  //   localStorage.setItem("user", JSON.stringify(userData)); // Persist admin user data
  //   setIsAdmin(true);
  // };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
        {/* Optional: Add a spinner or styled loader */}
      </div>
    );
  }

  // return (
  //   <Router>
  //     {user ? (
  //       <div className="App d-flex flex-column">
  //         {isAdmin ? (
  //           <AdminTopmenu onLogout={handleLogout} />
  //         ) : (
  //           <Topmenu onLogout={handleLogout} />
  //         )}
  //         <div
  //           className="main-content flex-grow-1"
  //           style={{ marginTop: "70px" }}
  //         >
  //           <Routes>
  //             <Route
  //               path="/*"
  //               element={
  //                 isAdmin ? (
  //                   <Navigate to="/admin-announcement" />
  //                 ) : (
  //                   <Navigate to="/profile" />
  //                 )
  //               }
  //             />
  //             {isAdmin ? (
  //               <>
  //                 <Route
  //                   path="/admin-announcement"
  //                   element={
  //                     isAdmin ? <AdminAnnouncement /> : <Navigate to="/login" />
  //                   }
  //                 />
  //                 <Route
  //                   path="/addAnnouncement"
  //                   element={<AddAnnouncement />}
  //                 />
  //                 <Route
  //                   path="/admin-event"
  //                   element={
  //                     isAdmin ? <AdminEvent /> : <Navigate to="/login" />
  //                   }
  //                 />
  //                 <Route path="/addEvent" element={<AddEvent />} />

  //                 <Route
  //                   path="/admin-facilities-booking"
  //                   element={
  //                     isAdmin ? (
  //                       <AdminFacilitiesbooking />
  //                     ) : (
  //                       <Navigate to="/login" />
  //                     )
  //                   }
  //                 />
  //                 <Route
  //                   path="/admin-complaint"
  //                   element={
  //                     isAdmin ? <AdminComplaint /> : <Navigate to="/login" />
  //                   }
  //                 />

  //                 <Route
  //                   path="/admin-facilities"
  //                   element={
  //                     isAdmin ? <AdminFacilities /> : <Navigate to="/login" />
  //                   }
  //                 />
  //               </>
  //             ) : (
  //               <>
  //                 <Route path="/profile" element={<Profile />} />
  //                 <Route path="/addEvent" element={<AddEvent />} />
  //                 <Route path="/event" element={<Event />} />
  //                 <Route path="/announcement" element={<Announcement />} />
  //                 <Route path="/statistic" element={<Statistic />} />
  //                 <Route
  //                   path="/facilities-booking"
  //                   element={<Facilitiesbooking />}
  //                 />
  //                 <Route
  //                   path="/addFacilitiesbooking"
  //                   element={<AddFacilitiesbooking />}
  //                 />
  //                 <Route path="/complaint" element={<Complaint />} />
  //                 <Route path="/addComplaint" element={<AddComplaint />} />
  //               </>
  //             )}

  //             {/* Admin-specific routes */}
  //           </Routes>
  //           <ToastContainer />
  //         </div>
  //       </div>
  //     ) : (
  //       <Routes>
  //         <Route path="/*" element={<Navigate to="/login" />} />
  //         <Route path="/login" element={<Login />} />
  //         <Route
  //           path="/admin-login"
  //           element={<AdminLogin onLogin={handleAdminLogin} />}
  //         />
  //         <Route path="/register" element={<SignUp />} />
  //       </Routes>
  //     )}
  //   </Router>
  // );

  return (
    <Router>
      {loading ? (
        <div>Loading...</div> // You can add a loading spinner here
      ) : (
        <div className="App d-flex flex-column">
          <>
            {isAdmin ? (
              <AdminTopmenu onLogout={handleLogout} />
            ) : (
              user && !isAdmin && <Topmenu onLogout={handleLogout} />
            )}
            {isAdmin && (
              <div
                className="main-content flex-grow-1"
                style={{ marginTop: "70px" }}
              >
                <Routes>
                  <Route
                    path="/*"
                    element={
                      isAdmin ? (
                        <Navigate to="/admin-announcement" />
                      ) : (
                        <Navigate to="/profile" />
                      )
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin-announcement"
                    element={
                      isAdmin ? <AdminAnnouncement /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/addAnnouncement"
                    element={
                      isAdmin ? <AddAnnouncement /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/admin-event"
                    element={
                      isAdmin ? <AdminEvent /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/addEvent"
                    element={isAdmin ? <AddEvent /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/admin-facilities-booking"
                    element={
                      isAdmin ? (
                        <AdminFacilitiesbooking />
                      ) : (
                        <Navigate to="/login" />
                      )
                    }
                  />
                  <Route
                    path="/admin-complaint"
                    element={
                      isAdmin ? <AdminComplaint /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/admin-facilities"
                    element={
                      isAdmin ? <AdminFacilities /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/admin-event-suggestions"
                    element={
                      isAdmin ? (
                        <AdminEventSuggestions />
                      ) : (
                        <Navigate to="/login" />
                      )
                    }
                  />
                </Routes>
              </div>
            )}
            {/* User Routes */}
            {user && !isAdmin && (
              <>
                <div className=" " style={{ marginTop: "70px" }}>
                  <Routes>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/event" element={<Event />} />
                    <Route path="/announcement" element={<Announcement />} />
                    <Route path="/statistic" element={<Statistic />} />
                    <Route
                      path="/facilities-booking"
                      element={<Facilitiesbooking />}
                    />
                    <Route
                      path="/addFacilitiesbooking"
                      element={<AddFacilitiesbooking />}
                    />
                    <Route path="/complaint" element={<Complaint />} />
                    <Route path="/addComplaint" element={<AddComplaint />} />

                    {/* Redirect non-admin users from admin pages */}
                    <Route
                      path="/"
                      element={<Navigate to="/announcement" />}
                    />
                    <Route
                      path="/admin-announcement"
                      element={<Navigate to="/announcement" />}
                    />
                    <Route
                      path="/addAnnouncement"
                      element={<Navigate to="/announcement" />}
                    />
                    <Route
                      path="/admin-event"
                      element={<Navigate to="/announcement" />}
                    />
                    <Route
                      path="/addEvent"
                      element={<Navigate to="/announcement" />}
                    />
                    <Route
                      path="/admin-facilities-booking"
                      element={<Navigate to="/announcement" />}
                    />
                    <Route
                      path="/admin-complaint"
                      element={<Navigate to="/announcement" />}
                    />
                    <Route
                      path="/admin-facilities"
                      element={<Navigate to="/announcement" />}
                    />
                    <Route
                      path="/admin-event-suggestions"
                      element={<Navigate to="/announcement" />}
                    />
                    <Route path="*" element={<Navigate to="/announcement" />} />
                  </Routes>
                </div>
              </>
            )}
            {!isAdmin && !user && (
              <Routes>
                <Route path="/*" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/admin-login"
                  element={<AdminLogin onLogin={handleAdminLogin} />}
                />
                <Route path="/register" element={<SignUp />} />
              </Routes>
            )}
          </>
          {/* ) : (
            <Routes>

            </Routes>
          )} */}
        </div>
      )}
      <ToastContainer />
    </Router>
  );
}

export default App;
