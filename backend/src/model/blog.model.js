import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        unique : true,
        trim : true
    },
    content : {
        type :String,
        required : true
    },
    image : {
        type : [String],
        default : null
    },
    author : {
        type : String,
        required : true,
    },
    date : {
        type : String,
        required : true
    },
    topic : {
        type : [String],
        default : null
    },
    likes : {
        type : Number,
        default : null
    },
    isUpdated : {
        type : Boolean,     // To compare original vs updated blog after scraping
        default : false
    }
    ,
    references : {
        type : [String],   // refrences 
        default : []
    }
});

export const blogModel = mongoose.model("Blog", blogSchema);