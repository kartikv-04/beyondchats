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
const PORT = process.env.PORT || 5000;


// use all app functions
app.use(express.json());

// enable cors - must be before routes
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
}));

// Health check route
app.get("/", (_req, res) => {
    res.send("API Working .....");
})

app.use('/blogs', blogRouter);

// Listen to Server after DB connectoin
const startServer = async () => {
    try {
        await connectDB(); // WAIT for Mongo

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};

startServer();




