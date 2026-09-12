const express = require("express");
const router = express.Router();

const {
  predictAttendanceRisk
} = require("../controllers/aiController");

const {
  protect
} = require("../middleware/authMiddleware");

router.get(
  "/attendance-risk",
  protect,
  predictAttendanceRisk
);

module.exports = router;