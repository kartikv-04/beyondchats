// Import all necessary packages
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import blogRouter from './routes/route.js'
import { connectDB } from "./config/db.js";

// config dotenv
dotenv.config();

// Create express instance
const app = express();

// use all app functions
app.use(express.json());

// enable cors - must be before routes
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
}));

app.use('/blogs', blogRouter);

// Listen to Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB();
    console.log(`Server Started: http://localhost:${PORT}`);
});

// Health check route
app.get("/", (_req, res) => {
    res.send("API Working .....");
})




