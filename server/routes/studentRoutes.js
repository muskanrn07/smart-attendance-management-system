const express = require("express");
const router = express.Router();

const {
  addStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  bulkAddStudents
} = require("../controllers/studentController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");


// ===============================
// ADD SINGLE STUDENT
// ===============================
router.post(
  "/",
  protect,
  addStudent
);


// ===============================
// BULK ADD STUDENTS
// ===============================
router.post(
  "/bulk",
  protect,
  bulkAddStudents
);


// ===============================
// GET ALL STUDENTS
// ===============================
router.get(
  "/",
  protect,
  getStudents
);


// ===============================
// GET SINGLE STUDENT
// ===============================
router.get(
  "/:id",
  protect,
  getStudent
);


// ===============================
// UPDATE STUDENT
// ===============================
router.put(
  "/:id",
  protect,
  updateStudent
);


// ===============================
// DELETE STUDENT
// ADMIN ONLY
// ===============================
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteStudent
);


module.exports = router;