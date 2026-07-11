// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDC6PDG-id7qrDEN37DJ32n0ew6HBhiIBg",
  authDomain: "rodadodrinks.firebaseapp.com",
  projectId: "rodadodrinks",
  storageBucket: "rodadodrinks.firebasestorage.app",
  messagingSenderId: "552484960442",
  appId: "1:552484960442:web:fdf816e4b1d8c64cd26a83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exporte o app se for utilizá-lo em outros arquivos JS
export { app };
