import { Router } from "express";
import { getBlog, getOneBlog, postBlog } from "../controller/blog.controller.js";

// initialize router 
const router = Router();

// POST, GET For Blogs
router.post('/', postBlog);
router.get('/', getBlog);
router.get('/:id', getOneBlog);

export default router;