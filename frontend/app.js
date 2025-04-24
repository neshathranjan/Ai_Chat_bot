import { auth, onAuthStateChanged, signOut } from '../../firebase.js';
const url = "http://localhost:5000/gemini";
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
  }
});

document.getElementById("logout-btn").onclick = () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};