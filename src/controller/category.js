const Category = require('../models/category');
const slugify = require('slugify');

createCategories=(categories, parentId= null)=>{
    const categoryList =[];
    let category;
    if(parentId == null){
        category = categories.filter(cat => cat.parentId == undefined);
    }else{
        category = categories.filter(cat => cat.parentId == parentId);
    }   
    for(let cat of category){
        categoryList.push({
            _id: cat._id,
            name: cat._name,
            slug: cat.slug,
            children: createCategories(categories, cat._id)
        });
    }
    return categoryList;
};  

exports.addCategory = ((req,res) => {
    const categoryObj = {
        name: req.body.name,
        slug: slugify(req.body.name)
    }

    if(req.body.parentId){
        categoryObj.parentId = req.body.parentId;
    }

    //console.log("I am in the category outside save");
    const _cat = new Category(categoryObj);
    _cat.save((error,category) => {
        //console.log("I am here in the category save");
        if(error)      return res.status(400).json({error});
        if(category)   return res.status(201).json({category});
    });
});

exports.fetchCategory = (req,res)=>{
    Category.find({})
    .exec((error,categories)=>{
        if(error) return res.status(400).json({
            error
        });
        if(categories){
            res.status(200).json({categories});
        }
    })
};

exports.fetchCategories = (req,res)=>{
    Category.find({})
    .exec((error,categories)=>{
        if(error) return res.status(400).json({
            error
        });
        if(categories){
            const categoryList  = createCategories(categories);
            res.status(200).json({categoryList});
        }
    })
};