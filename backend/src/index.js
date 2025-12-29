// Import all necessary packages
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import blogRouter from './routes/index.js'
// import { runScrapper } from "./scrapblog.js";

// config dotenv
dotenv.config();

// Create express instance
const app = express();

// use all app functions
app.use(express.json());

app.use('/blogs', blogRouter);

// enable cors
app.use(cors({
    origin : '*',
    methods : ["GET", "POST", "PATCH"],
    credentials : true
}));

// Function to connect database
async function connectDB (){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connected Successfully");
    }
    catch(error){
        console.error("Error in connecting Databased : ", error);
    }
}

// Listen to Server
let PORT=5000;
app.listen(PORT, ()=>{
    connectDB();     // Connect Database here 
    console.log(`Server Started  : http://localhost:${PORT}`);
    // runScrapper();
});

// Health check route
app.get("/",(req, res)=>{
    res.send("API Working .....");
})




