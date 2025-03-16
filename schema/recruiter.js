const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true, // Optional: If frequently searching by user_id
    },
    phone: {
        type: String, // Changed to String for better flexibility
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    contactNo: {
        type: String, // Kept as String (optional)
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    jobId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: false, // Fixed typo
        index: true, // Optional: If frequently searching by jobId
    }]
});



const jobSchema = new mongoose.Schema({
    jobRole:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        required:false,
        default:""
    },
    salary:{
        type:String,
        required:false,
    },
    department:{
        type:String,
        required:true,
    },
    recruiterId: { // Add this field to reference the recruiter
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter', // Reference to Recruiter model
        required: true
    },
    applicants:{
        type:[String],
        require:false
    }
});

// Method to add applicant
jobSchema.methods.addApplicant = async function(userId) {
    // Ensure the userId is a mongoose ObjectId if it's passed as a string
    const objectId = new mongoose.Types.ObjectId(userId);  // Use `new` to create ObjectId

    if (!this.applicants.includes(objectId)) {
        this.applicants.push(objectId);
        await this.save();
    } else {
        throw new Error("User has already applied.");
    }
};

jobSchema.methods.hasUserApplied = async function(userId) {
    // Ensure the userId is a mongoose ObjectId if it's passed as a string
    const objectId = new mongoose.Types.ObjectId(userId);  // Use `new` to create ObjectId

    // Check if the userId is already in the applicants array
    return this.applicants.includes(objectId);
};


const Recruiter = mongoose.model("Recruiter", recruiterSchema);
const Job = mongoose.model("Job",jobSchema);

module.exports ={Recruiter,  Job};