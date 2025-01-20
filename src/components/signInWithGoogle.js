import React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebase";
import { toast } from "react-toastify";
import { setDoc, doc, getDoc } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";

function SignInWithGoogle() {
  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();

    // Add custom parameters to force account selection
    provider.setCustomParameters({
      prompt: "select_account", // Forces account selection
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        // Check if the email ends with '@siswa.um.edu.my'
        if (!user.email.endsWith("@siswa.um.edu.my")) {
          toast.error("Invalid email domain. Please use your siswamail.", {
            position: "top-center",
          });
          // Sign out the user and redirect to login page
          await auth.signOut();
          window.location.href = "/login";
          return;
        }

        const userRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(userRef);

        // Check if the document exists
        if (!docSnap.exists()) {
          await setDoc(userRef, {
            email: user.email,
            name: user.displayName,
            photo: user.photoURL,
            matricNo: user.email.split("@")[0],
          });
        }

        // toast.success("User logged in Successfully", {
        //   position: "top-center",
        // });
        window.location.href = "/profile";
      }
    } catch (error) {
      console.error("Error logging in: ", error);
      toast.error("Login failed!", {
        position: "top-center",
      });
    }
  };

  return (
    <div>
      <div
        style={{ display: "flex", justifyContent: "center", cursor: "pointer" }}
        onClick={googleLogin}
      >
        <img
          src={require("../google.png")}
          width={"60%"}
          alt="Google Sign-In"
        />
      </div>
    </div>
  );
}

export default SignInWithGoogle;
