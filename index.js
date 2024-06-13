const express =require("express");
const port =5000;
const app =express();
require("dotenv").config();

// Router
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

const bodyParser = require("body-parser");
// for storing cookies and validating them
const cookieParser = require("cookie-parser");
// connecting DB
const connect = require("./config/db");

// cors for fetching data from frontend
var cors = require("cors");

connect();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(cookieParser());
app.use("/discussion", postRoutes);
app.use("/users", userRoutes);
app.listen(port,()=>{
    console.log("Server is running .....")
})