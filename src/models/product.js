const mongoose = require('mongoose');
const productScehma = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim: true
    },
    slug:{
        type: String,
        required:true,
        trim: true
    },
    price:{
        type: Number,
        required:true
    },
    description:{
        type: String,
        required:true,
        trim: true
    },
    offer:{
        type: Number
    },
    productImages: [{
        img:{ type: String }
    }],
    quantity:{
        type: String,
        required:true
    },
    reviews:[{
        type: mongoose.Schema.Types.ObjectId, ref:'User',
        review: String
    }],
    category:{
        type: mongoose.Schema.Types.ObjectId, ref:'Category',
        required:true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    updatedAt: Date,
},{timestamps :true});

module.exports = mongoose.model('Product',productScehma);