const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {register, login, refreshToken} = require('../controller/auth');
const { validateRegisterRequest, validateLoginRequest, isRequestValidated } = require('../Validators/validation');


router.post('/login', validateLoginRequest, isRequestValidated, login);

router.post('/register',validateRegisterRequest, isRequestValidated, register);

router.post('/refresh-token',refreshToken);

module.exports = router;