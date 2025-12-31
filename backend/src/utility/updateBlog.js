// Phase:2  
// Steps : 
// 1. Get the titles of blog from Database
// 2. Search Seeded Blog on Google and scrap from top two sites
// 3. Scrap the main content/body of the blog
// 4. Pass that main content into llm and ask it to proper format and structure
// 5. Save the Blog to database/seed. Add citation or reference
// Complete

import { blogModel } from "../model/blog.model.js"
import { connectDB } from "../config/db.js";
import axios from "axios";
import dotenv from "dotenv";
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const CACHE_PATH = path.join(process.cwd(), 'cache', 'blogContent.json');

dotenv.config();

// Connect to Database First
await connectDB();

// 1. Get the Blog titles from database
const getBlogTitle = async()=>{
    try {
        // Get titles from Database
        const docs = await blogModel.find({}, {title : 1, _id: 0});
        const titles = docs.map(doc=>doc.title);
        return titles;
    }
    catch(error){
        console.error("Error Fetching Title from Database : ", error.message);
        return [];
    }
}

// 2. Search Titles On google to get links
const googleSearch = async (query)=> {
    try {
        // Use SERPAPI for google search
        const url = "https://www.searchapi.io/api/v1/search";
        const params = {
            engine: "google",
            q: query,
            api_key: process.env.SERP_API
        };

        // axios for google search
        const res = await axios.get(url, { params });
        const data = res.data;

        let links = [];

        // only include link which is not from beyondchat and max 2 links
        for (const result of data.organic_results) {
            if (
                result.link &&
                !result.link.includes("beyondchats.com")
            ) {
                links.push(result.link);
            }

            if (links.length === 2) break;
        }

        return links;
    }
    catch(error){
        console.error("Error searching on Google:", error.message);
        return [];
    }
};

// 2.5. Extract main content from HTML using cheerio
const extractMainContentFromHTML = (html) => {
    const $ = cheerio.load(html);

    // Remove junk elements
    $('script, style, nav, footer, header, aside, iframe, form').remove();

    let best = null;
    let maxScore = 0;

    // Find best content container based on text length and paragraph count
    $('article, main, section, div').each((_, el) => {
        const $el = $(el);
        const textLength = $el.text().trim().length;
        const pCount = $el.find('p').length;

        const score = textLength + pCount * 100;

        if (score > maxScore) {
            maxScore = score;
            best = $el;
        }
    });

    const container = best || $('body');

    // Filter duplicate and short content
    let seen = new Set();

    return container
        .find('h1, h2, h3, h4, p, li')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(text => {
            if (!text || text.length < 40 || seen.has(text)) return false;
            seen.add(text);
            return true;
        })
        .join('\n\n');
};

// 3. Scrap the main content of blog using link from google search
const scrapMainContent = async ()=> {
    try {
        // Check cache first
        try {
            const cached = await fs.readFile(CACHE_PATH, 'utf-8');
            const parsed = JSON.parse(cached);

            // object-based cache validation
            if (parsed && Object.keys(parsed).length > 0) {
                console.log("Using cached content");
                return parsed;
            }
        } catch {}

        // Get all titles from database
        const titles = await getBlogTitle();
        
        if (!titles || titles.length === 0) {
            console.warn("No titles found in database");
            return {};
        }

        console.log(`Processing ${titles.length} blog titles...`);
        let results = {};
        let blogIndex = 1;

        // Process each title sequentially (titles loop)
        for (const t of titles) {
            const links = await googleSearch(t);

            if (!links || links.length === 0) {
                console.warn(`No links found for title: ${t}`);
                continue;
            }

            const blogKey = `blog${blogIndex++}`;

            results[blogKey] = {
                title: t,
                sources: {}
            };

            // Scrape all links in parallel for better performance
            const scrapePromises = links.map(async (link, i) => {
                try {
                    const res = await axios.get(link, { timeout: 15000 });
                    const content = extractMainContentFromHTML(res.data);

                    if (content && content.length > 300) {
                        return {
                            index: i + 1,
                            url: link,
                            content
                        };
                    }
                    return null;
                } catch (err) {
                    console.error(`Failed scraping ${link}:`, err.message);
                    return null;
                }
            });

            // Wait for all scraping to complete
            const scrapeResults = await Promise.all(scrapePromises);

            // Add successful scrapes to results
            scrapeResults.forEach(result => {
                if (result) {
                    results[blogKey].sources[`source${result.index}`] = {
                        url: result.url,
                        content: result.content
                    };
                }
            });
        }

        // Save results to cache
        await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
        await fs.writeFile(
            CACHE_PATH,
            JSON.stringify(results, null, 2),
            'utf-8'
        );

        console.log(`Scraping complete. Processed ${Object.keys(results).length} blogs with total sources: ${Object.values(results).reduce((sum, blog) => sum + Object.keys(blog.sources).length, 0)}`);
        return results;
    }
    catch(error){
        console.error(`Error Scraping main body of the blog: ${error.message}`);
        return {};
    }
};



scrapMainContent();

