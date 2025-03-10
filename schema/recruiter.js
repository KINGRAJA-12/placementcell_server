const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    companyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Company",
        required:true,
    },
    jobId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job",
        required:flase
    }]

});

const companySchema = new mongoose.Schema({
    companyName:{
        type:String,
        required:true
    },
    contactNo:{
        type:String,
        required:false
    },
    address1:{
        type:String,
        required:false,
    },
    addresss:{
        type:String,
        required:false
    },
    email:{
        type:String,
        required:true
    }
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
    deparment:{
        type:String,
        required:true,
    }
});

const Recruiter = mongoose.model("Recruiter", recruiterSchema);
const Company = mongoose.model("Company",companySchema);
const Job = mongoose.model("Job",jobSchema);

module.exports ={Recruiter, Company, Job};