import { connectDB } from "../config/db.js";
import { intialBlogData, mainBlogData, seedblog } from "./scrapblog.js";

// Function To run seed blog 
export const scrapIntialBlog = async () => {
    try {

        // Connect to database first
        await connectDB();

        // Get initial blog data
        let blogs = await intialBlogData();
        if (blogs.length > 0) {
            await mainBlogData();   //Get link from blogs array and scrap main content
        }
        console.log(`Total Blogs Scrapped : ${blogs.length}`);

        // Seed the blog into database
        await seedblog();

        return blogs;
    }
    catch (error) {
        console.error("Error while seeding Blogs", error);
    }
}

// Export function - remove immediate execution for orchestrator
// scrapIntialBlog();