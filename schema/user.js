const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const { notify } = require('../routes/recrutordetail');

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true,
        enum:["student", "tpo", "recruiter"]
    },
    notify:{
        type:[Object],
        required:false
    }
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.addNotification = async function(message, type) {
    const notification = {
        message,
        type, // Add type to distinguish between accepted or rejected
        date: new Date(),
    };

    this.notify.push(notification);
    await this.save(); // Save the user with the new notification
    return notification;
};

console.log("i run double")
const User = mongoose.model('User', userSchema);
module.exports = User;