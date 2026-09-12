const Student = require("../models/Student");

// ===============================
// ADD STUDENT
// ===============================
const addStudent = async (req, res) => {
    try {
        const {
            studentId,
            name,
            email,
            course,
            semester,
            section,
            phone,
            status
        } = req.body;

        // Required fields
        if (!studentId || !name || !email || !course || !semester || !section) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        // Semester validation
        if (semester < 1 || semester > 8) {
            return res.status(400).json({
                success: false,
                message: "Semester must be between 1 and 8."
            });
        }

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // Duplicate ID
        const existingId = await Student.findOne({ studentId });

        if (existingId) {
            return res.status(400).json({
                success: false,
                message: "Student ID already exists."
            });
        }

        // Duplicate email
        const existingEmail = await Student.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already exists."
            });
        }

        const student = await Student.create({
            studentId,
            name,
            email,
            course,
            semester,
            section,
            phone,
            status: status || "Active"
        });

        res.status(201).json({
            success: true,
            message: "Student added successfully.",
            student
        });

    } catch (error) {
        console.error("Add Student Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to add student."
        });
    }
};


// ===============================
// GET ALL STUDENTS
// ===============================
const getStudents = async (req, res) => {
    try {

        const students = await Student.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {

        console.error("Get Students Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch students."
        });
    }
};


// ===============================
// GET SINGLE STUDENT
// ===============================
const getStudent = async (req, res) => {
    try {

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        res.json({
            success: true,
            student
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Unable to fetch student."
        });
    }
};


// ===============================
// UPDATE STUDENT
// ===============================
const updateStudent = async (req, res) => {
    try {

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        // Check duplicate email
        if (req.body.email && req.body.email !== student.email) {

            const emailExists = await Student.findOne({
                email: req.body.email,
                _id: { $ne: req.params.id }
            });

            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists."
                });
            }
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            message: "Student updated successfully.",
            student: updatedStudent
        });

    } catch (error) {

        console.error("Update Student Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update student."
        });
    }
};


// ===============================
// DELETE STUDENT
// ===============================
const deleteStudent = async (req, res) => {
    try {

        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        res.json({
            success: true,
            message: "Student deleted successfully."
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Unable to delete student."
        });
    }
};


// ===============================
// BULK ADD STUDENTS
// ===============================
const bulkAddStudents = async (req, res) => {
    try {

        const { students } = req.body;

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No students found."
            });
        }

        const validStudents = [];

        for (const student of students) {

            if (
                !student.studentId ||
                !student.name ||
                !student.email ||
                !student.course ||
                !student.semester ||
                !student.section
            ) {
                continue;
            }

            validStudents.push({
                studentId: student.studentId,
                name: student.name,
                email: student.email,
                course: student.course,
                semester: Number(student.semester),
                section: student.section,
                phone: student.phone || "",
                status: student.status || "Active"
            });
        }

        if (validStudents.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid student records found."
            });
        }

        const result = await Student.insertMany(
            validStudents,
            { ordered: false }
        );

        res.status(201).json({
            success: true,
            message: "Students uploaded successfully.",
            added: result.length,
            failed: validStudents.length - result.length
        });

    } catch (error) {

        console.error("Bulk Upload Error:", error);

        res.status(500).json({
            success: false,
            message: "Bulk upload failed."
        });
    }
};


module.exports = {
    addStudent,
    getStudents,
    getStudent,
    updateStudent,
    deleteStudent,
    bulkAddStudents
};