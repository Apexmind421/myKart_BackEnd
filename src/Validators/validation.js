const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.validateRegisterRequest = [
    check('firstName').notEmpty().withMessage('First Name is required'),
    check('lastName').notEmpty().withMessage('Last Name is required'),
    check('email').isEmail().withMessage('Valid Email is required'),
    check('password').isLength({ min: 8 }).withMessage('Must be at least 8 charecters')
        .matches(/\d/).withMessage('must contain a number')];

exports.validateLoginRequest = [
    check('email').isEmail().withMessage('Valid Email is required'),
    check('password').isLength({ min: 8 }).withMessage('Must be at least 8 charecters')
        .matches(/\d/).withMessage('must contain a number')];

exports.isRequestValidated = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.array().length > 0)
        return res.status(400).json({ errors: errors.array()[0].msg })
    next();
}

exports.requireLogin = ((req, res, next)=>{
    if(req.headers.authorization){
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        const user = jwt.verify(token,process.env.JWT_SECRET);
        req.user = user;
        console.log(req.user);
        next();
    }
    else{
        return res.status(400).json({message: 'Require sign in'})
    } 
});

exports.middleware = ((req,res,next)=>{
    console.log(req.user.role);
    if(req.user.role !=='admin')
        return res.status(400).json({message: 'Access Denied'})
    next();
});

