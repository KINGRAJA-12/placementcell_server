const mongoose = require('mongoose');

const tpoSchema = mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    organization_id: {  // Can be company_id OR academic_id
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'referenceModel'  // Dynamic reference field
    },
    referenceModel: {  
        type: String,
        required: true,
        enum: ["Company", "Academic"]  
    },
})