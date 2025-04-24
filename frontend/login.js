import {
    auth,
    signInWithPopup,
    GoogleAuthProvider,
    // FacebookAuthProvider,
    // createUserWithEmailAndPassword,
    // signInWithEmailAndPassword
  } from './firebase.js';
  
  // const email = document.getElementById("email");
  // const password = document.getElementById("password");
  
  // document.getElementById("signup-btn").onclick = () => {
  //   createUserWithEmailAndPassword(auth, email.value, password.value)
  //     .then(() => window.location.href = "index.html")
  //     .catch(err => alert(err.message));
  // };
  
  // document.getElementById("login-btn").onclick = () => {
  //   signInWithEmailAndPassword(auth, email.value, password.value)
  //     .then(() => window.location.href = "index.html")
  //     .catch(err => alert(err.message));
  // };
  
  document.getElementById("google-login").onclick = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
  .then((result) => {
    const user = result.user;
    console.log("User Info:", user);  // Log entire user object to check
    if (user.displayName) {
      console.log("User Name:", user.displayName);  // Ensure the name is available
      localStorage.setItem('userName', user.displayName);  // Store name in localStorage
    } else {
      console.log("No display name found");
    }
    window.location.href = "index.html";  // Redirect to chatbot page
  })
  .catch((error) => {
    console.error("Login failed:", error.message);
    alert(error.message);
  });
}