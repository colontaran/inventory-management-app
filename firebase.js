// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcrzXQ37vQlKTdp-Jtrbkm85Gi4z2FdX0",
  authDomain: "inventory-management-app-798a7.firebaseapp.com",
  projectId: "inventory-management-app-798a7",
  storageBucket: "inventory-management-app-798a7.appspot.com",
  messagingSenderId: "235616729319",
  appId: "1:235616729319:web:27c4105bdd20c5f0834a42",
  measurementId: "G-1KSNBBH50K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const firestore = getFirestore(app)

export {firestore}