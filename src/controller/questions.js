const Questions = require("../models/Questions");

exports.addQuestion = (req, res) => {
  const questionObj = {
    question: req.body.question,
  };

  if (req.body.answer) {
    questionObj.answer = req.body.answer;
  }

  if (req.body.product) {
    questionObj.product = req.body.product;
  }

  const _question = new Questions(questionObj);
  _question.save((error, question) => {
    //console.log("I am here in the category save");
    if (error) return res.status(400).json({ error });
    if (question) return res.status(201).json({ question });
  });
};

exports.addAnswer = (req, res) => {};

exports.getQuestions = (req, res) => {
  Questions.find({})
    .populate("product")
    .exec((error, questions) => {
      if (error)
        return res.status(400).json({
          error,
        });
      if (questions) {
        res.status(200).json({ questions });
      }
    });
};
