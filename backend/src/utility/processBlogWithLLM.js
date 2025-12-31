// Phase:2 - Steps 4 & 5
// Steps :
// 4. Pass that main content into llm and ask it to proper format and structure
// 5. Save the Blog to database/seed. Add citation or reference
// Complete

import { blogModel } from "../model/blog.model.js";
import { connectDB } from "../config/db.js";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();

// Configuration
const CONFIG = {
  cachePath: path.join(process.cwd(), "cache", "blogContent.json"),
  apiUrl: "http://localhost:5000/blogs",
  groqUrl: "https://api.groq.com/openai/v1/chat/completions",
  model: "llama-3.3-70b-versatile",
  rateLimitDelay: 35000,
  minContentLength: 300,
};

// 4. Call Groq LLM API to process content
const callLLM = async (prompt) => {
  const response = await fetch(CONFIG.groqUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: CONFIG.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Groq error: ${response.status} - ${await response.text()}`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// 4.1. Build prompt for LLM with original and scraped content
const buildPrompt = (title, originalContent, sources) => {
  const scrapedText = sources
    .map((s, i) => `Source ${i + 1} (${s.url}):\n${s.content}`)
    .join("\n\n---\n\n");

  const references = sources.map((s, i) => `${i + 1}. ${s.url}`).join("\n");

  return `You are a professional blog content editor. Update the original article to match the quality of top-ranking Google articles.

                Tasks:
                1. Restructure content to be well-organized, engaging, and professional
                2. Integrate valuable information from scraped sources
                3. Improve readability with proper headings and formatting
                4. Make it SEO-friendly and publication-ready

                Add a References section at the end:
                ---
                References:
                ${references}

                Original Blog Title: ${title}

                Original Content:
                ${originalContent}

                Top-Ranking Articles:
                ${scrapedText}

                Provide only the formatted blog content with References section. No explanations.`;
};

// 4.2. Process content through LLM
const processWithLLM = async (title, content, sources) => {
  try {
    return await callLLM(buildPrompt(title, content, sources));
  } catch (error) {
    console.error(`Error processing "${title}":`, error.message);
    return null;
  }
};

// 5. Save processed blog to database with references via POST API
const saveBlog = async (original, content, urls) => {
  try {
    const response = await fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: original.title,
        author: original.author || "BeyondChats Editorial",
        content,
        date: new Date().toISOString().split("T")[0],
        image: original.image || [],
        topic: original.topic || [],
        references: urls,
        isUpdated: true,
      }),
    });

    const result = await response.json();

    if (response.status === 409) {
      console.log(`Blog "${original.title}" already exists, skipping...`);
      return null;
    }

    if (!response.ok) {
      throw new Error(result.error || `API error: ${response.status}`);
    }

    console.log(`Published: ${original.title}`);
    return result.blog;
  } catch (error) {
    console.error(`Error saving blog:`, error.message);
    return null;
  }
};

// Helper: Extract valid sources from cached data
const extractSources = (sources) => {
  const valid = [];
  const urls = [];

  for (const [key, { url, content }] of Object.entries(sources)) {
    if (content && content.length >= CONFIG.minContentLength) {
      valid.push({ url, content });
      urls.push(url);
      console.log(`  Added ${key} from ${url}`);
    }
  }

  return { valid, urls };
};

// Main function to process all blogs
const processAllBlogs = async () => {
  try {
    const cachedData = JSON.parse(await fs.readFile(CONFIG.cachePath, "utf-8"));

    if (!cachedData || Object.keys(cachedData).length === 0) {
      console.warn("No cached data found. Run updateBlog.js first.");
      return;
    }

    const blogEntries = Object.entries(cachedData);
    console.log(`Processing ${blogEntries.length} blogs...\n`);

    let count = 0;

    for (const [, { title, sources }] of blogEntries) {
      const original = await blogModel.findOne({ title, isUpdated: false });

      if (!original) {
        console.warn(`Original blog not found: ${title}`);
        continue;
      }

      console.log(`Processing: ${title}`);
      const { valid, urls } = extractSources(sources);

      if (valid.length === 0) {
        console.warn(`No valid sources, skipping...`);
        continue;
      }

      console.log(`  Processing with LLM (${valid.length} sources)...`);
      const processed = await processWithLLM(title, original.content, valid);

      if (!processed) {
        console.error(`Failed to process`);
        continue;
      }

      if (await saveBlog(original, processed, urls)) {
        count++;
      }

      console.log(
        `  Waiting ${CONFIG.rateLimitDelay / 1000}s for rate limit...`
      );
      await new Promise((r) => setTimeout(r, CONFIG.rateLimitDelay));
    }

    console.log(`\nComplete! Saved ${count} blogs.`);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Export function for use in orchestrator
export { processAllBlogs };
