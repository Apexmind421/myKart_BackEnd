const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const {
  register,
  login,
  getAllUserList,
  user_edit,
  deleteUserById,
  signout,
} = require("../../controller/admin/auth");
const {
  validateRegisterRequest,
  validateLoginRequest,
  isRequestValidated,
  requireLogin,
} = require("../../Validators/validation");

router.post("/admin/login", validateLoginRequest, isRequestValidated, login);
router.post(
  "/admin/register",
  validateRegisterRequest,
  isRequestValidated,
  register
);
router.post("/admin/signout", signout);
/*router.post('/profile',requireLogin,(req,res)=>{
    res.status(200).json({user:'profile'})
});*/
router.post("/admin/getusers", requireLogin, getAllUserList);

router.patch("/admin/user/info", requireLogin, user_edit);
//Delete User
router.delete("/admin/user", requireLogin, deleteUserById);
module.exports = router;
