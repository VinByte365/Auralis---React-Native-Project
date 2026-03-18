const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../configs/.env") });

const User = require("../models/userModel");

const createSuperAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected to database...");

    const email = "admin@consoliscan.com";
    const password = "adminPassword123!"; // Change this password immediately after login
    const name = "System Owner";

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      console.log("User already exists. Updating role to admin...");
      user.role = "admin";
      await user.save();
      console.log(`User ${email} is now an Admin.`);
    } else {
      console.log("Creating new Admin user...");
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
        status: "active",
        sex: "male", // Default value, can be updated later
        age: 30, // Default value
      });

      console.log(`Admin user created successfully!`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error creating Admin user:", error);
    process.exit(1);
  }
};

createSuperAdmin();
