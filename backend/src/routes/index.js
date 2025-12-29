import { Router } from "express";
import { getBlog, getOneBlog, postBlog } from "../controller/blog.controller.js";

// initialize router 
const router = Router();

// POST, GET For Blogs
router.post('blogs', postBlog);
router.get('/', getBlog);
router.get('blogs/:id', getOneBlog);

export default router;