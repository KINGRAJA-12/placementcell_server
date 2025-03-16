const express = require("express");
const recruiter = express.Router();
const {Recruiter, Job} = require("../schema/recruiter");
const StudentProfile = require("../schema/student");
const User = require("../schema/user");

// Save or Update Recruiter Profile
const saveRecruiterDetail = async (req, res) => {
  try {
    const { user_id, phone, companyName, contactNo, address } = req.body;

    if (!user_id || !phone || !companyName) {
      return res.status(400).json({ error: "User ID, Phone, and Company Name are required" });
    }

    const profileData = { user_id, phone, companyName, contactNo, address };

    // Check if the recruiter profile already exists
    const existingProfile = await Recruiter.findOne({ user_id });

    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await Recruiter.findOneAndUpdate(
        { user_id },
        profileData,
        { new: true }
      );
      return res.status(200).json({ message: "Profile updated successfully", recruiter: updatedProfile });
    }

    // Create new profile if not found
    const newRecruiter = new Recruiter(profileData);
    await newRecruiter.save();
    res.status(201).json({ message: "Profile saved successfully", recruiter: newRecruiter });

  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Recruiter Profile
const getRecruiterProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const recruiter = await Recruiter.findOne({ user_id: userId });

    if (!recruiter) return res.status(404).json({ error: "Recruiter not found" });

    res.status(200).json({
      phone: recruiter.phone,
      companyName: recruiter.companyName,
      contactNo: recruiter.contactNo,
      address: recruiter.address,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Recruiter Profile (PATCH)
const updateRecruiterProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, companyName, contactNo, address } = req.body;

    // Find and update profile
    const updatedProfile = await Recruiter.findOneAndUpdate(
      { user_id: userId },
      { phone, companyName, contactNo, address },
      { new: true }
    );

    if (!updatedProfile) return res.status(404).json({ error: "Profile not found" });

    res.status(200).json({ message: "Profile updated successfully", recruiter: updatedProfile });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Routes


const createJob = async (req, res) => {
  try {
    
    
    const { jobRole, desc, salary, department} = req.body;
    console.log("i work",jobRole,desc,salary,department)
    if (!jobRole || !department ) {
      return res.status(400).json({ error: "Job role, department, and recruiterId are required" });
    }

    // Check if recruiter exists
    const recruiter = await Recruiter.findOne({user_id:req.user.id});
    if (!recruiter) return res.status(404).json({ error: "Recruiter not found" });

    // Create new Job
    const newJob = new Job({
      jobRole,
      desc,
      salary,
      department,
      recruiterId:recruiter._id
    });

    const savedJob = await newJob.save();

    // Update recruiter to include the job
    recruiter.jobId.push(savedJob._id);
    await recruiter.save();

    res.status(201).json({ message: "Job created successfully", job: savedJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const editjob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { jobRole, desc, salary, department } = req.body;

    // Find and update job
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { jobRole, desc, salary, department },
      { new: true } // Return updated job
    );

    if (!updatedJob) return res.status(404).json({ error: "Job not found" });

    res.status(200).json({ message: "Job updated successfully", job: updatedJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Find job
    const job = await Job.findById(jobId);
    if (!job) return res.status(400).json({ error: "Job not found" });

    // Delete job
    await Job.findByIdAndDelete(jobId);

    // Remove job from recruiter's job list
    await Recruiter.updateMany(
      { jobId: jobId },
      { $pull: { jobId: jobId } }
    );

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getJob =  async (req, res) => {
  try {
    const userId = req.user.id; // User's ID from authentication

    // Find recruiter using user_id
    const recruiter = await Recruiter.findOne({ user_id: userId }).populate("jobId");

    if (!recruiter) return res.status(404).json({ error: "Recruiter not found" });

    res.status(200).json({ jobs: recruiter.jobId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const applyForJob = async (req, res) => {
  try {
      const { jobId } = req.params;
      const userId = req.user.id; // Get user ID from authentication middleware
      console.log("i run",jobId)
      const job = await Job.findOne({_id:jobId})
      console.log(job)
      // if (!job) {
      //     return res.status(400).json({ message: "Job not found" });
      // }

      // Add applicant to the job
      console.log("i run also")
      await job.addApplicant(userId);
      console.log("i run also")
      res.status(200).json({ message: "Applied successfully", job });
  } catch (error) {
    console.log(error.message)
      res.status(400).json({ error: error.message });
  }
};


// Get all jobs with recruiter details
const getAllJobsWithRecruiterDetails = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have userId from auth middleware

    // Fetch all jobs and populate recruiter details
    const jobs = await Job.find().populate({
      path: 'recruiterId', // Populate recruiterId field in the Job model
      select: 'companyName phone contactNo address' // Select only necessary recruiter details
    });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found' });
    }

    // Map through jobs and check if the user has already applied
    const jobsWithApplicationStatus = await Promise.all(jobs.map(async (job) => {
      const hasApplied = await job.hasUserApplied(userId); // Check if the user has applied for this job
      return {
        _id: job._id,
        jobRole: job.jobRole,
        desc: job.desc,
        salary: job.salary,
        department: job.department,
        recruiter: job.recruiterId, // recruiter details populated here
        hasApplied, // Adding the application status
      };
    }));

    // Return all jobs with recruiter details and application status
    res.status(200).json({
      jobs: jobsWithApplicationStatus, // Returning jobs with application status
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


recruiter.get('/all-jobs-with-applicants', async (req, res) => {
  try {
    // Fetch all jobs and populate the applicants array to get the user_ids
    const jobs = await Job.find().populate('applicants'); // Populate applicants with their user_id

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found' });
    }

    // For each job, fetch the student profiles based on applicants (user_id)
    const jobsWithApplicants = [];

    for (let job of jobs) {
      // Fetch the student profiles for each applicant in the job's applicants array
      const studentProfiles = await StudentProfile.find({
        user_id: { $in: job.applicants }, // Match user_id in StudentProfile with applicants
      }).populate('user_id', 'name email'); // Populate user details (name, email)

      // Add the job and its applicants to the result
      jobsWithApplicants.push({
        jobId: job._id,
        jobRole: job.jobRole,
        desc: job.desc,
        salary: job.salary,
        department: job.department,
        applicants: studentProfiles.map(profile => ({
          studentId: profile._id,
          name: profile.user_id.name,
          email: profile.user_id.email,
          regNo: profile.regNo,
          phone: profile.phone,
          education: profile.education,
          experience: profile.experience,
          resume: profile.resume,
          userid:profile.user_id._id
        })),
      });
    }

    // Return the jobs with their applicants' details
    res.status(200).json({
      jobs: jobsWithApplicants,
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

recruiter.post('/send-application-status/:userId/:jobId', async (req, res) => {
  try {
      const { userId, jobId } = req.params;
      const { status } = req.body; // status should be 'accepted' or 'rejected'

      // Validate status
      if (!['accepted', 'rejected'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status. Must be "accepted" or "rejected".' });
      }
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Find the job by ID
      const job = await Job.findById(jobId);
      if (!job) {
          return res.status(404).json({ error: 'Job not found' });
      }

      // Create the message based on the status
      const message = `Your application for the job "${job.jobRole}" has been ${status}.`;

      // Add the notification to the user's profile
      const notification = await user.addNotification(message, status);

      // Return the notification response
      res.status(200).json({
          message: 'Application status notification sent successfully.',
          notification,
      });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});



recruiter.route("/userside")
  .get(getAllJobsWithRecruiterDetails);
recruiter.route("/apply/:jobId")
  .patch(applyForJob)



recruiter.route("/job/:jobId")
  .delete(deleteJob)
  .patch(editjob);
recruiter.route("/job/")
  .get(getJob)
  .post(createJob);
  



recruiter.route("/")
  .get(getRecruiterProfile)
  .post(saveRecruiterDetail)
  .patch(updateRecruiterProfile);


module.exports = recruiter;