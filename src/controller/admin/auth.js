const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const shortid = require('shortid');

module.exports.register = ((req, res)=>{
    User.findOne({ email: req.body.email })
    .exec(async (error, user) => {
        if(user) return res.status(400).json({
            message: 'Admin already registered'
        });

        const {
            firstName,
            lastName,
            email,
            password
        } = req.body;
        const hash_password = await bcrypt.hash(password, 10);
        const _user = new User({ 
            firstName, 
            lastName, 
            email, 
            hash_password,
            username: shortid.generate(),
            role: 'admin'
        });

        _user.save((error, data) => {
            if(error){
                return res.status(400).json({
                    message: 'Something went wrong'
                });
            }

            if(data){
                const token = jwt.sign({_id: data._id, role: data.role},process.env.JWT_SECRET,{expiresIn: '1h'});
                const { _id, firstName, lastName, email, role, fullName} = data;
                res.cookie('token', token, { expiresIn: '1d' });
                return res.status(201).json({
                    token,
                    user:{
                        _id, firstName, lastName, email, role
                    },
                    message: 'Admin created Successfully..!'
                })
            }
        });



    });
});


module.exports.login = ((req,res)=>{
    User.findOne({ email: req.body.email }).exec(async (error, user) => {
        if (error) return res.status(400).json({ error });
        if (user) {
          const isPassword = await user.authenticate(req.body.password);
          if (isPassword && user.role === "admin") {
            const token = jwt.sign(
              { _id: user._id, role: user.role },
              process.env.JWT_SECRET,
              { expiresIn: "1d" }
            );
            const { _id, firstName, lastName, email, role, fullName } = user;
            res.cookie("token", token, { expiresIn: "1d" });
            res.status(200).json({
              token,
              user: { _id, firstName, lastName, email, role, fullName },
            });
          } else {
            return res.status(400).json({
              message: "Invalid Password",
            });
          }
        } else {
          return res.status(400).json({ message: "Something went wrong" });
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

module.exports.signout = ((req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        message: 'Signout successfully...!'
    })
});