const Questions = require("../models/questions");

exports.addQuestion = (req, res) => {
  if (req.body.question && req.user._id) {
    const questionObj = {
      question: req.body.question,
      user_id: req.user._id,
    };

    if (req.body.answer) {
      questionObj.answer = req.body.answer;
      questionObj.answered_by = req.user._id;
    }

    if (req.query.productId) {
      questionObj.product = req.query.productId;
    }

    /*if (req.body.votes) {
    questionObj.answer = req.body.answer;
  }*/

    const _question = new Questions(questionObj);
    _question.save((error, question) => {
      //console.log("I am here in the category save");
      if (error) return res.status(400).json({ error });
      if (question) return res.status(201).json({ question });
    });
  } else {
    return res.status(400).json({ message: "missing inputs" });
  }
};

exports.updateQuestion = async (req, res) => {
  if (req.query.questionId && req.user._id) {
    try {
      /* const ques = await Questions.findOne(
        { _id: req.query.questionId },
        { queston: 0, _id: 0, answer: 0, __v: 0, createdAt: 0, updatedAt: 0 }
      );*/
      Questions.findOne(
        { _id: req.query.questionId },
        { _id: 0, votes: 1 }
        //queston: 0, _id: 0, answer: 0, __v: 0, createdAt: 0, updatedAt: 0 }
      ).exec((err, ques) => {
        let questionObj = {};
        if (req.body.answer) {
          questionObj.answer = req.body.answer;
          questionObj.answered_by = req.user._id;
        }

        if (req.body.vote) {
          const alreadyVoted = ques.votes.findIndex(
            (x) => x.toString() === req.user._id.toString()
          );
          if (alreadyVoted < 0) {
            ques.votes.push(req.user._id);
            questionObj.votes = ques.votes;
            questionObj = { ...questionObj, $inc: { totalVotes: 1 } };
          }
        }

        //  questionObj.votes = [];
        /* if (req.query.product) {
      questionObj.product = req.query.product;
    }

    if (req.body.votes) {
    questionObj.answer = req.body.answer;
  }*/

        Questions.findByIdAndUpdate(req.query.questionId, questionObj, {
          new: true,
        }).exec((error, question) => {
          //console.log("I am here in the category save");
          if (error) return res.status(400).json({ error });
          if (question) return res.status(201).json({ question });
        });
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  } else {
    return res.status(400).json({ message: "Missing inputs" });
  }
};

//exports.addAnswer = (req, res) => {};

exports.getQuestions = (req, res) => {
  const args = req.query.prodId ? { product: req.query.prodId } : {};
  const args1 =
    req.query.includeUnAnswered && req.query.includeUnAnswered == "true"
      ? { ...args }
      : { ...args, answer: { $ne: null } };
  //If Show Un Answered show all the questions otherwise only answered
  Questions.find(args1)
    .populate({ path: "product", select: ["_id", "name"] })
    .sort({ totalVotes: -1 })
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

exports.deleteQuestions = (req, res) => {
  Questions.deleteOne({ _id: req.query.questionId }).exec(
    (error, questions) => {
      if (error)
        return res.status(400).json({
          error,
        });
      if (questions) {
        return res.status(200).json({ message: "question deleted" });
      }
    }
  );
};

//TEMP
exports.deleteAllQuestions = (req, res) => {
  Questions.deleteMany().exec((error, questions) => {
    if (error)
      return res.status(400).json({
        error,
      });
    if (questions) {
      return res.status(200).json({ message: "all questions deleted" });
    }
  });
};
