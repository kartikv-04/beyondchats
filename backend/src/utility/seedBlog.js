import { connectDB } from "../config/db.js";
import { getBlogData } from "./scrapblog.js";
import { getBlogContent } from "./scrapblog.js";
import { seedblog } from "./scrapblog.js";

// Function To run seed blog 
export const scrapIntialBlog = async ()=>{
    try {

        // Connect to database first
        await connectDB();

        // Get initial blog data
        let blogs = await getBlogData();
        if (blogs.length > 0){
            await getBlogContent();   //Get link from blogs array and scrap main content
        }
        console.log(`Total Blogs Scrapped : ${blogs.length}`);

        // Seed the blog into database
        await seedblog();

        return blogs;
    }
    catch(error){
        console.error("Error while seeding Blogs", error);
    }
}

// Export function - remove immediate execution for orchestrator
// scrapIntialBlog();