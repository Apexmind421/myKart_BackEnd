const Product = require('../models/product');
const slugify = require('slugify');
const shortid = require('shortid');

createProducts=(Products, parentId= null)=>{
    const productList =[];
    let product;
    if(parentId == null){
        product = Products.filter(prod => prod.parentId == undefined);
    }else{
        product = Products.filter(prod => prod.parentId == parentId);
    }   
    for(let prod of product){
        productList.push({
            _id: prod._id,
            name: prod._name,
            slug: prod.slug,
            children: createProducts(products, prod._id)
        });
    }
    return productList;
};  

exports.addProduct = ((req,res) => {
   const productObj = {
        name: req.body.name,
        slug: slugify(req.body.name),
        price: req.body.price,
        quantity:req.body.quantity,
        description: req.body.description,
        category:req.body.category,
        createdBy:req.user._id
    }

    if(req.files.length>0){
        productObj.productImages = req.files.map(file=>{
            return {img: file.filename}
        });
    };

    //console.log("I am in the product outside save");
    const _prod = new Product(productObj);
    _prod.save((error,product) => {
        //console.log("I am here in the product save");
        if(error)      return res.status(400).json({error});
        if(product)   return res.status(201).json({product});
    });

    
    //res.status(200).json({file: req.files, body: req.body});
});

exports.fetchProducts = (req,res)=>{
    Product.find({})
    .exec((error,products)=>{
        if(error) return res.status(400).json({
            error
        });
        if(products){
            const productList  = createProducts(products);
            res.status(200).json({productList});
        }
    })
};