const express = require("express");
const router = express.Router();
const {
  addQuestion,
  updateQuestion,
  getQuestions,
  deleteQuestions,
  deleteAllQuestions,
} = require("../controller/questions");
const { requireLogin, middleware } = require("../Validators/validation");

router.get("/question", getQuestions);
router.post("/question", requireLogin, addQuestion);
router.put("/question", requireLogin, updateQuestion);
router.delete("/question", requireLogin, middleware, deleteQuestions);
router.delete("/questions/all", requireLogin, middleware, deleteAllQuestions);
module.exports = router;
