const { requireLogin, middleware } = require("../Validators/validation");
const { getTeams } = require("../controller/teams");
const router = require("express").Router();

router.get("/getTeams", requireLogin, getTeams);

module.exports = router;
