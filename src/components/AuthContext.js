import React, { useContext, useEffect, useState } from "react";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  //const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState();

  const handleAdmin = (userData) => {
    console.log("Admin logged in: ", userData);
    sessionStorage.setItem("role", "admin"); // Persist admin role
    //localStorage.setItem("user", JSON.stringify(userData)); // Persist admin user data
    setIsAdmin(true);
  };


  //create login for admin
  //if not found in admin, through error
  //set admin flag = true

  useEffect(() => {
    checkIsAdmin()
    setLoading(false);
    // const unsubscribe = auth.onAuthStateChanged(
    //   async (user) => {
    //     console.log("ffdfdf", user);
    //     const admin =await checkIsAdmin (user)
    //     //set admin here
    //     if (user && !admin) {
    //       console.log('Login As User')
    //       setCurrentUser(user);
    //       setCurrentAdmin(null);
    //       setIsAdmin(false);
    //       setLoading(false);
    //     } else if (user && admin) {
    //       console.log("Login As Admin ", admin)
    //       setCurrentAdmin(user)
    //       setLoading(false);
    //     } else {
    //       setCurrentAdmin(null);
    //       setCurrentUser(null);
    //       setIsAdmin(false);
    //       setLoading(false);
    //     }
    //   },
    //   (error) => {
    //     // Handle any errors from the authentication state change
    //     console.error("Authentication state change error: ", error);
    //     setLoading(false);
    //   }
    // );
    // return unsubscribe;
  }, []);

  async function checkIsAdmin(){
    console.log(sessionStorage.getItem("role"))
    if(sessionStorage.getItem("role") === "admin"){
        console.log("dfsdfd")
        setIsAdmin(true);
    }
    else setIsAdmin(false);

  }

  function logoutAdmin() {
    // console.log("Logout Clicked");
    sessionStorage.clear();
    setIsAdmin(false);
    // return auth.signOut();
  }

  const value = {
    isAdmin,
    handleAdmin,
    logoutAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}