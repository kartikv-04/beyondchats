// Import all necessary packages
import express from "express";
import cors from "cors";
import blogRouter from './routes/index.js'
import { connectDB } from "./config/db.js";

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

// Listen to Server
let PORT=5000;
app.listen(PORT, ()=>{
    connectDB();     // Connect Database here 
    console.log(`Server Started  : http://localhost:${PORT}`);
});

// Health check route
app.get("/",(_req, res)=>{
    res.send("API Working .....");
})




