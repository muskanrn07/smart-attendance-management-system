const Attendance = require("../models/Attendance");

// Overall Attendance Report
const getAttendanceReport = async (req, res) => {
  try {
    const report = await Attendance.aggregate([
      {
        $group: {
          _id: "$student",
          totalClasses: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
            }
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ["$status", "Absent"] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $unwind: "$student"
      },
      {
        $project: {
          _id: 0,
          studentId: "$student.studentId",
          name: "$student.name",
          course: "$student.course",
          semester: "$student.semester",
          section: "$student.section",
          totalClasses: 1,
          present: 1,
          absent: 1,
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$present", "$totalClasses"] },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      {
        $sort: {
          percentage: 1
        }
      }
    ]);

    res.json({
      success: true,
      count: report.length,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Low Attendance Report
const getLowAttendance = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 75;

    const report = await Attendance.aggregate([
      {
        $group: {
          _id: "$student",
          totalClasses: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
            }
          }
        }
      },
      {
        $match: {
          $expr: {
            $lt: [
              {
                $multiply: [
                  { $divide: ["$present", "$totalClasses"] },
                  100
                ]
              },
              threshold
            ]
          }
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $unwind: "$student"
      },
      {
        $project: {
          _id: 0,
          studentId: "$student.studentId",
          name: "$student.name",
          course: "$student.course",
          semester: "$student.semester",
          totalClasses: 1,
          present: 1,
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$present", "$totalClasses"] },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      {
        $sort: {
          percentage: 1
        }
      }
    ]);

    res.json({
      success: true,
      threshold,
      count: report.length,
      students: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAttendanceReport,
  getLowAttendance
};