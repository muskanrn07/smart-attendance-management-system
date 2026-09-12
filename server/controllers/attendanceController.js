const Attendance = require("../models/Attendance");

// Mark Attendance
const markAttendance = async (req, res) => {
  try {
    const { student, date, subject, status } = req.body;

    if (!student || !date || !subject || !status) {
      return res.status(400).json({
        success: false,
        message: "Student, date, subject and status are required"
      });
    }

    const attendance = await Attendance.create({
      student,
      date,
      subject,
      status,
      markedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      attendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this student, subject and date"
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Bulk Attendance
const bulkAttendance = async (req, res) => {
  try {
    const { date, subject, attendance } = req.body;

    if (!date || !subject || !attendance || !Array.isArray(attendance)) {
      return res.status(400).json({
        success: false,
        message: "Date, subject and attendance list are required"
      });
    }

    const records = attendance.map((item) => ({
      student: item.student,
      date,
      subject,
      status: item.status,
      markedBy: req.user.id
    }));

    const result = await Attendance.insertMany(records, {
      ordered: false
    });

    res.status(201).json({
      success: true,
      message: "Attendance saved successfully",
      count: result.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get Attendance
const getAttendance = async (req, res) => {
  try {
    const { date, subject, student } = req.query;

    const filter = {};

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);

      filter.date = {
        $gte: start,
        $lt: end
      };
    }

    if (subject) filter.subject = subject;
    if (student) filter.student = student;

    const attendance = await Attendance.find(filter)
      .populate("student", "studentId name course semester section")
      .populate("markedBy", "name email")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  markAttendance,
  bulkAttendance,
  getAttendance
};