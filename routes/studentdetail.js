const express = require('express');
const studentDetail = express.Router();
const {
    Student, Acedamic, Document
} = require('../schema/student');


const saveStudentDeatil = async (req, res, next) =>{
    try {
        const {
            reg_no,
            phone,
            college_name,
            degree,
            status,
            skill
        } = req.body;

        

    } catch (err) {
        console.log(err.message)
        res.status(500).json({err:"Internal server error"});
    }
}

studentDetail.route("/")
.get()
.post()
.patch()

module.exports = studentDetail;