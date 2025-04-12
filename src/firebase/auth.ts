import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebaseConfig';

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists, if not create it
    await createUserDocument(user);
    
    return { success: true, user };
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    return { success: false, error: error.message };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's profile with the display name
    await updateProfile(user, { displayName });
    
    // Create the user document in Firestore
    await createUserDocument(user);
    
    return { success: true, user };
  } catch (error: any) {
    console.error('Error signing up with email:', error);
    return { success: false, error: error.message };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error('Error signing in with email:', error);
    return { success: false, error: error.message };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return { success: false, error: error.message };
  }
};

// Create or update user document in Firestore
export const createUserDocument = async (user: User) => {
  if (!user?.uid) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = serverTimestamp();

    try {
      await setDoc(userRef, {
        uid: user.uid,
        displayName,
        email,
        photoURL,
        createdAt,
        lastLogin: createdAt,
        // Default user preferences
        preferences: {
          theme: 'light',
          showCompletedTasks: true,
          notificationsEnabled: true
        }
      });
      
      // Create initial collections for the user
      await setDoc(doc(collection(db, `users/${user.uid}/lists`), 'default'), {
        name: 'My Tasks',
        color: '#219ebc',
        createdAt,
        isDefault: true
      });
      
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  } else {
    // Update last login time
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
  }
  
  return userRef;
}; 