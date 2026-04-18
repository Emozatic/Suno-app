const mongoose = require("mongoose");
const {Schema}= mongoose;

const songSchema= new Schema ({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
        require:true
    },
    song:{
        type:String,
        required:true,
    }
})

const SongListing= mongoose.model("SongListing",songSchema);
module.exports= SongListing