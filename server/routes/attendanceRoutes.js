const express = require("express");
const router = express.Router();

const {
  markAttendance,
  bulkAttendance,
  getAttendance
} = require("../controllers/attendanceController");

const {
  protect
} = require("../middleware/authMiddleware");

// Get attendance
router.get("/", protect, getAttendance);

// Mark single attendance
router.post("/", protect, markAttendance);

// Mark attendance for multiple students
router.post("/bulk", protect, bulkAttendance);

module.exports = router;