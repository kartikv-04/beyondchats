// Master Orchestrator - Runs All Phases
// Phase 1: Scrape blogs from BeyondChats and save to database
// Phase 2: Search Google, scrape content, process with LLM, and publish

import { connectDB } from "../config/db.js";
import { scrapIntialBlog } from "./seedBlog.js";
import { scrapMainContent } from "./updateBlog.js";
import { processAllBlogs } from "./processBlogWithLLM.js";
import dotenv from "dotenv";

dotenv.config();

// Main orchestrator function
const runAllPhases = async () => {
  try {
    console.log("=".repeat(60));
    console.log("Starting Complete Blog Processing Pipeline");
    console.log("=".repeat(60));

    // Connect to Database Once
    console.log("\nConnecting to Database...");
    await connectDB();
    console.log("Database Connected\n");

    // Phase 1: Scrape blogs from BeyondChats
    console.log("=".repeat(60));
    console.log("PHASE 1: Scraping Blogs from BeyondChats");
    console.log("=".repeat(60));
    const phase1Result = await scrapIntialBlog();
    if (!phase1Result || phase1Result.length === 0) {
      console.warn("Phase 1: No blogs scraped. Exiting...");
      return;
    }
    console.log(`✓ Phase 1 Complete: ${phase1Result.length} blogs scraped\n`);

    // Phase 2 Steps 1-3: Search Google and scrape content
    console.log("=".repeat(60));
    console.log("PHASE 2 (Steps 1-3): Google Search & Content Scraping");
    console.log("=".repeat(60));
    const phase2aResult = await scrapMainContent();
    if (!phase2aResult || Object.keys(phase2aResult).length === 0) {
      console.warn("Phase 2 Steps 1-3: No content scraped. Exiting...");
      return;
    }
    console.log(
      `✓ Phase 2 Steps 1-3 Complete: ${Object.keys(phase2aResult).length} blogs with scraped content\n`
    );

    // Phase 2 Steps 4-5: Process with LLM and publish
    console.log("=".repeat(60));
    console.log("PHASE 2 (Steps 4-5): LLM Processing & Publishing");
    console.log("=".repeat(60));
    await processAllBlogs();
    console.log("Phase 2 Steps 4-5 Complete\n");

    console.log("=".repeat(60));
    console.log("ALL PHASES COMPLETE!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\nError in pipeline:", error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run the complete pipeline
runAllPhases();

