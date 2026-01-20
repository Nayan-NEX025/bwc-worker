import mongoose from 'mongoose';
import BLOG_STATUS, {BLOG_STATUS_VALUES} from '../../constants/enums/blogStatus.enum.js';
const blogSchema = new mongoose.Schema({
     title:{
        type:String,
        required:[true, 'title is required'], 
     },
    content: {
        type: String,
        required: [true, 'content is required'], 
     },

     slug: {
        type: String,
        unique: true, 
        lowercase: true,
     },
    tags: {
         type: [String],
         default: []
    },
    status: {
        type: String,
        enum: BLOG_STATUS_VALUES,   
        default: BLOG_STATUS.DRAFT,
        index: true,
    },
}, {timestamps: true })


export const Blog = mongoose.model('Blog', blogSchema);