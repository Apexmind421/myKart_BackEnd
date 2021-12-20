const cloudinary = require('cloudinary').v2;

const cloudinaryConfig = (req, res, next) => {cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
next()
}

exports.cloudinaryConfig = cloudinaryConfig
exports.uploader = cloudinary.uploader
/*
const fileFormat = (req, file, cb) => {
    if (file.mimetype === 'image/gif' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb ("error: only can upload image (jpeg, png or gif)")
    }
}

var uploadImage = multer({fileFilter: fileFormat, limits: {fileSize: 1048576}}) // 1048576 kb = 1024 kb * 1024 kb * 1 = 1 mb

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
});

async function addProduct(req, res){
    try {
        await uploadImage.single('images')(req, res, (err)=>{
            if(err) return res.status(400).json(failRes(err.message))
            Product.create(req.body, (err, product)=>{
                if (err) res.status(400).json(failRes(err))
                product.merchant = req.user //to insert user data into field merchant's product. not use push. push only can used if an array
                product.save()
             
                if (req.file == null){
                    return res.status(201).json(sucRes(product, "Add product success"))
                }
                let file = dUri.format(`${req.file.originalname}-${Date.now()}`, req.file.buffer)
                cloudinary.uploader.upload(file.content, {use_filename: true, folder: "eCommerce"}, (err, result) => {
                    if (err) return res.status(400).json(failRes(err));
                    product.images.push(result.secure_url)
                    product.save()
                    */