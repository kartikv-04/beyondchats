import { blogModel } from "../model/blog.model.js";

export const postBlog = async (req, res) => {
    try {
        // Destructure the body into elements
        const { title, author, date, content, image, topic, references, isUpdated } = req.body;

        // Check if required fields are not empty
        if (!title || !author || !date || !content) {
            console.log("Got empty fields..");
            return res.status(400).json({
                error: "Title, author, date and content are mandatory"
            })
        }

        // For non-updated blogs, check if blog with same title exists
        if (!isUpdated) {
            const blogExist = await blogModel.findOne({ title: title.trim() });
            if (blogExist) {
                console.log("User trying to add same blog twice");
                return res.status(409).json({
                    error: "Blog with Same title Already Exists"
                })
            }
        } else {
            // For updated blogs, check if updated version already exists
            const updatedBlogExist = await blogModel.findOne({
                title: title.trim(),
                isUpdated: true
            });
            if (updatedBlogExist) {
                console.log("Updated blog with this title already exists");
                return res.status(409).json({
                    error: "Updated blog with Same title Already Exists"
                })
            }
        }

        // Create new blog in Database
        const newBlog = await blogModel.create({
            title: title.trim(),
            author: author.trim(),
            content,
            date,
            image: image ? (Array.isArray(image) ? image : [image]) : [],
            topic: topic ? (Array.isArray(topic) ? topic : [topic]) : [],
            likes: 0,
            isUpdated: isUpdated || false,
            references: references || []
        })

        console.log("New Blog Saved.");
        return res.status(201).json({
            message: "New Blog Created Successfully",
            blog: newBlog
        })

    }
    catch (error) {
        console.error(`Error While Adding new blog : ${error}`);
        return res.status(400).json({
            error: { error }
        })
    }

}

export const getBlog = async (req, res) => {
    try {
        console.log("Get request recieveed")
        // Try getting All blogs from database
        const blogs = await blogModel.find();

        // return all blog in array
        return res.status(200).json({
            success: true,
            message: blogs
        })
    }
    catch (error) {
        console.error("Error getting All blog data :", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const getOneBlog = async (req, res) => {
    try {
        // Destructure the body
        const { id } = req.params;

        // Check if it is not empty
        if (!id) {
            return res.status(400).json({
                succes: false,
                message: "Got Empty Fields"
            })
        }

        // find blog with _id
        const blog = await blogModel.findById(id);

        //return that blog
        return res.status(200).json({
            success: true,
            message: blog
        })
    }
    catch (error) {
        console.error("Error getting blog", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }

}