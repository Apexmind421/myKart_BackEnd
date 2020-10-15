const User = require('../../models/user');
const jwt = require('jsonwebtoken');

module.exports.register = ((req, res)=>{
    User.findOne({email: req.body.email})
    .exec((error, user)=>{
        if(user) return res.status(400).json({
            message: 'Admin is already registered'
        });
        const {firstName, lastName, email, password} = req.body;
        const _user = new User({firstName, lastName, email, password, username: Math.random().toString(), role: 'admin'});
        _user.save((error, data)=>{
            if(error){
                    console.log(req.body);
                    return res.status(400).json({
                        message: "Something went wrong"
                    });
            }
            if(data){
                    console.log(data);
                    return res.status(201).json({
                        message: "Admin created successfully"
                    });
            }
        });
        //const _user = new User({firstName:"Baba", lastName:"Rabbit", email:"abc.421@gmail.com", password: "password", username: Math.random().toString()});
        //_user.save();
    });
});


module.exports.login = ((req,res)=>{
    User.findOne({email: req.body.email})
    .exec((error,user)=>{
        if(error) return res.status(400).json({
            message: 'User is not registered'
        });
        if(user){
            if(user.authenticate(req.body.password) && user.role === 'admin'){
                const token = jwt.sign({_id: user._id, role: user.role},process.env.JWT_SECRET,{expiresIn: '1h'});
                const {_id, firstName, lastName, email, role, fullName} = user;
                return res.status(201).json({
                    token,
                    user:{
                        _id, firstName, lastName, email, role, fullName
                    },
                    message: "Admin exists"
                });
            }
            else{
                return res.status(400).json({
                    message: "Invalid Password"
                });
            }
        }else{
            return res.status(400).json({
                message: "Something went wrong"
            });
        }
    });
});

module.exports.requireLogin = ((req, res, next)=>{
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    const user = jwt.verify(token,process.env.JWT_SECRET);
    req.user = user;
    next();
});