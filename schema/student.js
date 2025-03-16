const mongoose = require('mongoose');
const User = require('./user.js');


    
    const StudentProfileSchema = new mongoose.Schema({
        user_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        phone: {
          type: String,
          required: true,
          unique: true,
        },
        regNo: {
          type: String,
          required: true,
          unique: true,
        },
        education: [
          {
            degree: String,
            institution: String,
            year: String,
          },
        ],
        experience: [
          {
            company: String,
            role: String,
            years: String,
          },
        ],
        resume: {
          type: String, 
        },
      });
      
      const StudentProfile = mongoose.model("StudentProfile", StudentProfileSchema);
      
      module.exports = StudentProfile;