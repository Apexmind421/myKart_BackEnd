const express = require("express");
const router = express.Router();
const { addQuestion, getQuestions } = require("../controller/questions");
const { requireLogin, middleware } = require("../Validators/validation");

router.get("/question/fetchQuestions", getQuestions);
//router.post("/question/addQuestion", requireLogin, addQuestion);
router.post("/question/addQuestion", addQuestion);
module.exports = router;
