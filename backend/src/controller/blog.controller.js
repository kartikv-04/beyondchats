import { blogModel } from "../model/blog.model.js";

export const postBlog = async(req, res)=>{
    try{
        // Destructure the body into elements
        const {title, author, date, content, image, topic} = req.body;

        // Check if fields are not empty
        if (!title || !author || !date || !content || !image || !topic){
            console.log("Got empty fieds..");
            return res.status(400).json({
                error : "All Fields are mandatory"
            })
        }

        // check if blog does not exist and new
        const blogExist = await blogModel.findOne({title : title.trim()});
        if(blogExist){
            console.log("User trying to add same blog twice");
            return res.status(409).json({
                error : "Blog with Same title Aready Exists"
            })
        }

        // If does not exist add new blog to Database
        const newBlog = await blogModel.create({
            title : title.trim(),
            author : author.trim(),
            content,
            date,
            image : Array.isArray(image) ? image : [image],
            topic : Array.isArray(topic) ? topic : [topic],
            likes : 0,
            isUpdated : false,
            refrences : []
        })

        console.log("New Blog Saved.");
        return res.status(201).json({
            message : "New Blog Created Successfully"
        })
        
    }
    catch(error){
        console.error(`Error While Adding new blog : ${error}`);
        return res.status(400).json({
            error : {error}
        })
    }
    
}

export const getBlog = async(req, res)=>{
    try{
        console.log("Get request recieveed")
        // Try getting All blogs from database
        const blog = await blogModel.find();

        // return all blog in array
        return res.status(200).json({
            success : true,
            message : [blog]
        })
    }
    catch(error){
        console.error("Error getting All blog data :", error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error"
        })
    }
}

export const getOneBlog = async (req, res) =>{
    try {
        // Destructure the body
        const {blogId} = req.params;

        // Check if it is not empty
        if(!blogId){
            return res.status(400).json({
                succes : false,
                message : "Got Empty Fields"
            })
        }

        // find blog with blogid
        const blog = await blogModel.findOne({blogId});

        //return that blog
        return res.staus(200).json({
            success : true,
            message : blog
        })
    }
    catch(error){
        console.error("Error getting blog", error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error"
        })
    }

}