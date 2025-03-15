const express = require('express');
const cors = require('cors')
const connectDB = require('./db');
const auth = require('./routes/auth')
const cookieParser = require("cookie-parser");
const authenticateToken = require('./services/protect');
const studentDetail = require('./routes/studentdetail');

const app = express();
const PORT = process.env.PORT || 5000; 


app.use(cookieParser());
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
})); 
app.use(express.json());

app.use("/v1/userauth",auth)
app.use(authenticateToken)
app.use("/v1/student-detail", studentDetail)
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });