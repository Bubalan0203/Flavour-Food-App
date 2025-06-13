import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDDkNNglRYMvOzxf2vJARo9TU2ZiD5zvHQ",
  authDomain: "bachelorschef-ff923.firebaseapp.com",
  projectId: "bachelorschef-ff923",
  storageBucket: "bachelorschef-ff923.appspot.com",
  messagingSenderId: "718285938101",
  appId: "1:718285938101:web:56159473ad3c33e6600dfc",
  measurementId: "G-SLGMEQ9W9L"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
