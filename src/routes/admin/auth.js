const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const {register,login,signout} = require('../../controller/admin/auth');
const { validateRegisterRequest,validateLoginRequest,isRequestValidated } = require('../../Validators/validation');

router.post('/admin/login',validateLoginRequest,isRequestValidated,login);
router.post('/admin/register',validateRegisterRequest, isRequestValidated,register);
router.post('/admin/signout', signout);
/*router.post('/profile',requireLogin,(req,res)=>{
    res.status(200).json({user:'profile'})
});*/

module.exports = router;