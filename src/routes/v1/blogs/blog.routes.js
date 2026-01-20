import {
  createBlog,
  deleteBlogById,
  getAllBlogs,
  getblogById,
  updateBlog,
} from "../../../controllers/v1/blog/blog.controller.js";
import { Router } from "express";

const router = Router();

router.post("/", createBlog);
router.get("/", getAllBlogs);
router.get("/:id", getblogById);
router.delete("/:id", deleteBlogById);
router.patch("/:id", updateBlog);

export default router;
