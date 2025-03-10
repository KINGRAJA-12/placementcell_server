const mongoose = require('mongoose');
const User = require('./user.js');

const studentSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    reg_no:{
        type:String,
        ref:"Academic",
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    docuent_id:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Document",
        required:false
    }]
});

const academicSchema = new mongoose.Schema({
    _id:{
        type:String,
        required:true,
        unique:true,
    },
    college_name:{
        type:String,
        required:true,
    },
    degree:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        required:true
    },
    skill:[{
        type:String,
        required:true,
    }],
    certificate:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Document",
        required:false
    }]
},{_id:flase});

const documentSchema = new mongoose.Schema({
    path:{
        type:String,
        required:true,
    }
});


const Student = mongoose.model('Student', studentSchema);
const Academic = mongoose.model('Academic', academicSchema); // Fixed typo
const Document = mongoose.model('Document', documentSchema);

module.exports = { Student, Academic, Document }; 