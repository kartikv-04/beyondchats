import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    content : {
        type :String,
        required : true
    },
    image : {
        type : String,
        deafult : null
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
        type : String,
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
    refrences : {
        type : [String],   // refrences 
        default : [null]
    }
});

export const blogModel = mongoose.model("Blog", blogSchema);