const mongoose = require('mongoose');
const categoryScehma = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim: true
    },
    slug:{
        type: String,
        required:true,
        unique: true
    },
    type: {
        type: String
    },
    categoryImages: { type: String },
    parentId:{
        type: String,
    }
},{timestamps :true});

module.exports = mongoose.model('Category',categoryScehma);