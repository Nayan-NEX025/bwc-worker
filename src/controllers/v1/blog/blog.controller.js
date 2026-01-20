import { Blog } from "../../../models/blog/blog.model.js";

export const createBlog = async (req, res) => {
  try {
    let { title, content, slug, tags, status } = req.body;
    if (!title || !content || !slug || !tags || !status) {
      return res.status(500).json({
        message: "title, content, slug, tag, status are required",
      });
    }

    const checkexistingBlog = await Blog.findOne({ slug: slug });

    if (checkexistingBlog) {
      return res.status(409).json({
        message: "Blog with this slug already exists",
      });
    }

    const checkexistingBlogTitle = await Blog.findOne({ title: title });
    if (checkexistingBlogTitle) {
      return res.status(409).json({
        message: "Blog with this title already exists",
      });
    }

    const BlogData = await Blog.create({
      title,
      content,
      slug,
      tags,
      status,
    });

    return res.status(201).json({
      status: true,
      message: "Blog created successfully",
      data: BlogData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogData = await Blog.find({});
    return res.status(200).json({
      success: true,
      message: "Retrived all blogs",
      data: blogData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const getblogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blogData = await Blog.findById(id);

    if (!blogData) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog retrieved successfully",
      data: blogData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blogData = await Blog.findByIdAndDelete(id);

    if (!blogData) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, slug, tags, status } = req.body;

    const blogData = await Blog.findByIdAndUpdate(
      id,
      { title, content, slug, tags, status },
      { new: true, runValidators: true }
    );

    if (!blogData) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blogData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
