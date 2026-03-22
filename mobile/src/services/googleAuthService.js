import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import axiosInstance from "../helper/axiosInstance";
import { unwrapResult } from "./apiHelpers";

// Initialize Firebase (replace with your config)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

let googleConfigured = false;

function configureGoogleSignin() {
  if (googleConfigured) return;

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (!webClientId) {
    throw new Error("Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID");
  }

  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });

  googleConfigured = true;
}

export const googleSignIn = async () => {
  try {
    configureGoogleSignin();

    if (auth.currentUser) {
      await signOut(auth);
    }

    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    await GoogleSignin.signOut();

    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo?.data?.idToken || userInfo?.idToken;

    if (!idToken) {
      throw new Error("Missing Google ID token");
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;

    // Get ID token for backend verification
    const firebaseIdToken = await user.getIdToken();

    // Send token to backend for verification and JWT creation
    const apiResponse = await axiosInstance.post(
      "/api/v1/google",
      {
        idToken: firebaseIdToken,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        firebaseUid: user.uid,
      },
      { skipIntercept: true },
    );

    const result2 = unwrapResult(apiResponse);

    return {
      user: result2.user,
      token: result2.token,
    };
  } catch (error) {
    console.error("Google Sign-In Error:", error);

    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error("Google Sign-In cancelled");
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error("Google Sign-In already in progress");
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services not available");
      }
      if (error.code === statusCodes.SIGN_IN_FAILED) {
        throw new Error(
          "Google Sign-In failed in release build. Check Android OAuth client package/SHA fingerprints in Firebase.",
        );
      }
    }

    throw new Error(error?.message || "Google Sign-In failed");
  }
};

export const googleSignOut = async () => {
  try {
    configureGoogleSignin();
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    await signOut(auth);
  } catch (error) {
    console.error("Google Sign-Out Error:", error);
    if (auth.currentUser) {
      await signOut(auth);
    }
  }
};

export const getCurrentFirebaseUser = () => {
  return auth?.currentUser || null;
};

export const getFirebaseAuth = () => {
  return auth;
};
