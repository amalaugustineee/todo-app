import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFwawI-xKMgANnfNXCUPvS7GbJr3Zj-p0",
  authDomain: "todo-app-eecbd.firebaseapp.com",
  projectId: "todo-app-eecbd",
  storageBucket: "todo-app-eecbd.appspot.com",
  messagingSenderId: "942690909994",
  appId: "1:942690909994:web:82e4baa8b8b79b8a5ee853",
  measurementId: "G-6SHXY7PPVF"
};

/*
 * HOW TO FIX THE FIREBASE API KEY ERROR:
 * 
 * 1. Go to the Firebase Console: https://console.firebase.google.com/
 * 2. Select your project (or create a new one)
 * 3. Click on the gear icon (⚙️) next to "Project Overview" and select "Project settings"
 * 4. Scroll down to "Your apps" section
 * 5. If you haven't added a web app yet, click on the web icon (</>) to register a new web app
 * 6. After registering, you'll see the firebaseConfig object with all the required values
 * 7. Copy those values and replace the placeholders above
 * 8. The configuration should look something like this:
 *
 * const firebaseConfig = {
 *   apiKey: "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
 *   authDomain: "your-project-id.firebaseapp.com",
 *   projectId: "your-project-id",
 *   storageBucket: "your-project-id.appspot.com",
 *   messagingSenderId: "1234567890",
 *   appId: "1:1234567890:web:a1b2c3d4e5f6g7h8i9j0",
 *   measurementId: "G-ABC123DEF45"
 * };
 */

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with offline persistence
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('Firestore offline persistence enabled');
  })
  .catch((err) => {
    console.warn('Firestore offline persistence error:', err.code, err.message);
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Multiple tabs open, persistence only enabled in one tab');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      console.warn('Current browser does not support offline persistence');
    }
  });

export { auth, googleProvider, db };

// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Initialize Firebase