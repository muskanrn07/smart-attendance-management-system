const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const predictAttendanceRisk = async (req, res) => {
  try {
    const students = await Student.find({ status: "Active" });

    const predictions = [];

    for (const student of students) {

      const records = await Attendance.find({
        student: student._id
      });

      const totalClasses = records.length;

      if (totalClasses === 0) {
        predictions.push({
          studentId: student.studentId,
          name: student.name,
          attendancePercentage: 0,
          risk: "No Data",
          recommendation: "Attendance data is not available yet."
        });

        continue;
      }

      const presentClasses = records.filter(
        record => record.status === "Present"
      ).length;

      const percentage =
        (presentClasses / totalClasses) * 100;

      let risk;
      let recommendation;

      if (percentage < 60) {

        risk = "High Risk";

        recommendation =
          "Student should attend classes regularly and improve attendance immediately.";

      } else if (percentage < 75) {

        risk = "Medium Risk";

        recommendation =
          "Student needs to attend more classes to reach the required 75% attendance.";

      } else {

        risk = "Safe";

        recommendation =
          "Attendance is satisfactory. Maintain regular attendance.";

      }

      predictions.push({
        studentId: student.studentId,
        name: student.name,
        totalClasses,
        presentClasses,
        attendancePercentage:
          Number(percentage.toFixed(1)),
        risk,
        recommendation
      });
    }

    res.json({
      success: true,
      predictions
    });

  } catch (error) {

    console.error("AI Prediction Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate attendance prediction"
    });
  }
};

module.exports = {
  predictAttendanceRisk
};