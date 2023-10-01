const { requireLogin, middleware } = require("../Validators/validation");
const {
  addSetting,
  getAllSettings,
  getSettingById,
} = require("../controller/settings");
const router = require("express").Router();

router.post("/addSetting", requireLogin, middleware, addSetting);
router.get("/getAllSettings", getAllSettings);
router.get("/getSettingById", getSettingById);

module.exports = router;
