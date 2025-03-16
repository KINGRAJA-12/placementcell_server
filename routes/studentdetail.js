const express = require("express");
const studentDetail = express.Router();
const StudentProfile = require("../schema/student");
const multer = require("multer");
const path = require("path");

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
}).single("resume");

// Save or Update Student Profile
const saveStudentDetail = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("File upload error: ", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { phone, regNo, education, experience, user_id } = req.body;
      if (!phone || !regNo || !user_id) {
        return res.status(400).json({ error: "Phone, Registration No, and User ID are required" });
      }

      // Convert education & experience from string to JSON
      const educationData = education ? JSON.parse(education) : [];
      const experienceData = experience ? JSON.parse(experience) : [];

      const profileData = {
        user_id,
        phone,
        regNo,
        education: educationData,
        experience: experienceData,
        resume: req.file ? `uploads/${req.file.filename}` : null,
      };

      // Check if the user profile already exists
      const existingProfile = await StudentProfile.findOne({ user_id });

      if (existingProfile) {
        // Update existing profile
        const updatedProfile = await StudentProfile.findOneAndUpdate(
          { user_id },
          profileData,
          { new: true }
        );
        return res.status(200).json({ message: "Profile updated successfully", user: updatedProfile });
      }

      // Create new profile if not found
      const newUser = new StudentProfile(profileData);
      await newUser.save();
      res.status(201).json({ message: "Profile saved successfully", user: newUser });

    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
};


// Get Student Profile
const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("inside",req.user)
    const student = await StudentProfile.findOne({ user_id: userId });

    if (!student) return res.status(404).json({ error: "Student not found" });

    res.status(200).json({
      phone: student.phone,
      regNo: student.regNo,
      education: student.education,
      experience: student.experience,
      resume: student.resume ? `http://localhost:5000/${student.resume}` : null,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Student Profile (PATCH)
const updateStudentProfile = async (req, res) => {
  try {
    const { userId } = req.user.id
    const { phone, regNo, education, experience } = req.body;

    // Find and update profile
    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { user_id: userId },
      { phone, regNo, education: JSON.parse(education), experience: JSON.parse(experience) },
      { new: true }
    );

    if (!updatedProfile) return res.status(404).json({ error: "Profile not found" });

    res.status(200).json({ message: "Profile updated successfully", user: updatedProfile });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Routes
studentDetail.route("")
  .get(getStudentProfile)
  .post(saveStudentDetail)
  .patch(updateStudentProfile);

module.exports = studentDetail;
