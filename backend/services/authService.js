const User = require("../models/userModel");
const { createLog } = require("./activityLogsService");
const bcrypt = require("bcrypt");
const admin = require("../configs/firebase");

exports.register = async (request) => {
  if (!request.body) throw new Error("undefined body");
  const { name, email, age, sex, password } = request.body;
  console.log(request.body);

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email,
    age,
    sex,
    password: hashPassword,
  });

  const user = {
    userId: String(newUser._id),
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    status: newUser.status,
  };

  const token = await newUser.getToken();
  if (!token) throw new Error("failed to create  a token");

  return { ...user, token };
};

exports.login = async (request, response) => {
  const { email, password } = request.body;
  let userData = await User.findOne({ email }).select(
    "+password role email name status",
  );
  if (!userData) throw new Error("account does not exist");
  if (userData.status === "inactive") throw new Error("user is inactive");

  const isMatched = await bcrypt.compare(password, userData.password);
  if (!isMatched) throw new Error("password does not match");
  const jwtToken = await userData.getToken();
  if (!jwtToken) throw new Error("failed to generate user token");

  const user = {
    userId: String(userData._id),
    name: userData.name,
    email: userData.email,
    role: userData.role,
    status: userData.status,
  };
  // console.log(user);

  response.cookie("token", jwtToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  return { user, token: jwtToken };
};

exports.verifyToken = async (request) => {
  const { user } = request;
  let eligibilityStatus = null;
  const userData = await User.findById(user.userId);

  return { user: userData };
};

/**
 * Google Sign-In Authentication
 * Verifies Firebase ID token and creates/updates user account
 * Supports account linking by email
 */
exports.googleAuth = async (request, response) => {
  try {
    const { idToken, email, name, photoURL, firebaseUid } = request.body;

    if (!idToken) throw new Error("Missing ID token");

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken.email) {
      throw new Error("Invalid token: missing email");
    }

    // Check if user exists by email (account linking)
    let user = await User.findOne({ email: decodedToken.email });

    if (user) {
      // Update existing user with Firebase UID if not already set
      if (!user.firebaseUid) {
        user.firebaseUid = decodedToken.uid;
        if (name && !user.name) user.name = name;
        if (photoURL && !user.avatar) {
          user.avatar = { url: photoURL };
        }
        await user.save();
      }
    } else {
      // Create new user from Google auth data
      user = await User.create({
        firebaseUid: decodedToken.uid,
        name: decodedToken.name || name || decodedToken.email,
        email: decodedToken.email,
        avatar: photoURL ? { url: photoURL } : { url: decodedToken.picture },
        status: "active", // Auto-activate Google users
      });
    }

    if (!user) throw new Error("Failed to create/fetch user");

    // Generate our own JWT token
    const jwtToken = await user.getToken();
    if (!jwtToken) throw new Error("Failed to generate JWT token");

    // Set secure cookie
    response.cookie("token", jwtToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    // Create activity log
    await createLog(
      user._id,
      "LOGIN",
      "SUCCESS",
      `${user.name} logged in via Google`,
    );

    return {
      user: {
        userId: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      },
      token: jwtToken,
    };
  } catch (error) {
    console.error("Google Auth Error:", error);
    throw error;
  }
};

exports.logout = async (request, response) => {
  response.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  createLog(
    request.user.userId,
    "LOGOUT",
    "SUCCESS",
    `${request.user.name} logged out to the system as ${request.user.role}`,
  );
  return;
};
