import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Function to connect database
export async function connectDB (){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connected Successfully");
    }
    catch(error){
        console.error("Error in connecting Databased : ", error);
    }
}