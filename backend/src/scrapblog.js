import * as cheerio from 'cheerio';
import axios from "axios";
import { blogModel } from './model/blog.model.js';

// Define Blogs Array to store every data
let blogs = []

export const getBlogData = async () => {

    try {
        // Define URL and start scraping 
        const url = 'https://beyondchats.com/blogs/page/14/'  // URL for scraping
        let res = await axios.get(url);
        let data = res.data;
        let $ = cheerio.load(data);    // Loading response in cheerio
        let article = $('article');
        console.log(`Article found : ${article.length}`);  //Article element
        
        // loop over collection to get all article data
        article.each((index,ele)=>{
            let title = $(ele).find('.card-content > .entry-title > a').text();
            let author = $(ele).find('li.meta-author > a.ct-meta-element-author > span').text();
            let date = $(ele).find('li.meta-date > time.ct-meta-element-date').text();
            let topics = $(ele).find('li.meta-categories > a[rel]').text().split(" ");   //select rel attribute
            let link = $(ele).find('h2.entry-title > a').attr('href');
            
            // Now save all data in array
            if(title && link){     //Add valid ones only
                if(index > 3){     // Add last 5 oldest one
                blogs.push({
                    title : title,
                    author : author,
                    date : date,
                    topics : [...topics],
                    link : link,
                    image : [],
                    content : ""
                })
            }
            }
        })

        console.log(`Blog Added Successfully: Blog Length : ${blogs.length}`);
    }
    catch(error){
        console.error("Error in adding Blog Details : ", error)
    }
}

export const getBlogContent = async () => {
    const seen = new Set();
    console.log(`Starting to Fetch content For Blog : ${blogs.length} Blogs..`);

    for(let i=0;i < blogs.length; i++){
        const blog = blogs[i];

        try {
            const url = blog.link;
            const res = await axios.get(url);
            const data =  res.data;
            let $ = cheerio.load(data);

            // Get Blog Content Boduy
            const contentBody = $('#content > div > div.elementor-element.elementor-element-b2a436b.elementor-widget.elementor-widget-theme-post-content');

            // Get All images from blog content
            const imagesFromBlog = contentBody.find('img')
                .map((i,el)=>$(el).attr('src'))
                .get()
                .filter((src)=> src && src.startsWith('http'));

            // Get All Content/Text For Blog
            const blogContent = contentBody.find('h2, h3, p, ol, ul')
                .map((index, el)=>{
                    const $el = $(el);
                    let text = '';

                    if($el.is('ul')){  //find ul and add bullet point to list
                        const items = $el.find('li')
                            .map((i,li)=>$(li).text().trim())
                            .get()
                            .filter((text)=> text && text.length > 2)
                            .join('\n\n')
                        text = `•${items}`                          
                    }
                    if($el.is('ol')){   //find ol and add num to list
                        const items = $el.find('li')
                            .map((i,li)=>$(li).text().trim())
                            .get()
                            .filter((text)=> text && text.length > 2)
                            .join('\n\n')
                        text = `${index}. ${items}`                          
                    }
                    else{
                        text = $(el).text().trim();

                    }
                    return text;
                }) 
                .get()
                .filter((text)=>{
                    if(!text || text.length === 0 || seen.has(text)){  //dont repeat or add repating text
                        return false;
                    }
                    seen.add(text);
                    return true;

                })
                .join('\n\n');
                

            // Update Blog Feilds
            blog.image = imagesFromBlog;
            blog.content = blogContent;

            await new Promise(resolve => setTimeout(resolve, 1500));

            
        }
        catch(error){
            console.error("Error in getting Blog Data : ", error);
        }
    
    }

    console.log("All Blogs Fetched Successfully");
     
}

// Save the blogs into Databse
async function seedblog () {
    try {
        for (let blog of blogs){
            const newBlog = new blogModel({
                title : blog.title,
                author : blog.author,
                content : blog.content,
                date : blog.date,
                likes : 0,
                image : blog.image,
                topic : blog.topics,
                isUpdated : false,
            })
            await newBlog.save();
        }
        console.log("All Blogs Saved successfully into Database..");
    }
    catch(error){
        console.error("Error while saving blog in database", error);
    }
}

export const runScrapper = async ()=>{
    await getBlogData();
    if (blogs.length > 0){
        await getBlogContent();
    }
    console.log(`Total Blogs Scrapped : ${blogs.length}`);
    await seedblog();

    return blogs;
}









