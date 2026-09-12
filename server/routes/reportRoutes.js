const express = require("express");
const router = express.Router();

const {
  getAttendanceReport,
  getLowAttendance
} = require("../controllers/reportController");

const {
  protect
} = require("../middleware/authMiddleware");

// Complete attendance report
router.get("/", protect, getAttendanceReport);

// Low attendance report
router.get("/low-attendance", protect, getLowAttendance);

module.exports = router;