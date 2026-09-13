const ATTENDANCE_API = "https://smart-attendance-management-system-96xa.onrender.com"

// ==========================================
// CHECK LOGIN
// ==========================================

if (typeof checkAuthentication === "function") {
    checkAuthentication();
}


// ==========================================
// LOAD USER
// ==========================================

function loadUser() {

    const storedUser = localStorage.getItem("user");

    if (!storedUser) return;

    try {

        const user = JSON.parse(storedUser);

        const userName =
            document.getElementById("userName");

        const userRole =
            document.getElementById("userRole");

        const userAvatar =
            document.getElementById("userAvatar");


        if (userName) {
            userName.textContent =
                user.name || "User";
        }

        if (userRole) {
            userRole.textContent =
                user.role || "Faculty";
        }

        if (userAvatar) {
            userAvatar.textContent =
                (user.name || "U")
                    .charAt(0)
                    .toUpperCase();
        }

    } catch (error) {

        console.error(
            "User loading error:",
            error
        );

    }

}


// ==========================================
// LOAD ALL STUDENTS
// ==========================================

async function loadStudentsForAttendance() {

    const token =
        localStorage.getItem("token");

    const tableBody =
        document.getElementById(
            "attendanceTableBody"
        );


    if (!tableBody) {
        console.error(
            "attendanceTableBody not found"
        );
        return;
    }


    if (!token) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Please login again.
                </td>
            </tr>
        `;

        return;
    }


    try {

        console.log(
            "Loading all students..."
        );


        const response =
            await fetch(
                `${ATTENDANCE_API}/students`,
                {
                    method: "GET",
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Students for attendance:",
            data
        );


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load students"
            );

        }


        const students =
            data.students || [];


        if (students.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No students found.
                    </td>
                </tr>
            `;

            return;
        }


        // ======================================
        // SHOW EVERY STUDENT
        // ======================================

        tableBody.innerHTML =
            students.map(student => {

                return `
                    <tr>

                        <td>
                            ${escapeHTML(
                                student.studentId || "-"
                            )}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    student.name || "-"
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(
                                student.course || "-"
                            )}
                        </td>

                        <td>
                            ${student.semester || "-"}
                        </td>

                        <td>
                            ${escapeHTML(
                                student.section || "-"
                            )}
                        </td>

                        <td>

                            <label>
                                <input
                                    type="radio"
                                    name="attendance_${student._id}"
                                    value="Present"
                                >
                                Present
                            </label>

                            &nbsp;&nbsp;

                            <label>
                                <input
                                    type="radio"
                                    name="attendance_${student._id}"
                                    value="Absent"
                                >
                                Absent
                            </label>

                        </td>

                    </tr>
                `;

            }).join("");


        console.log(
            `Loaded ${students.length} students`
        );

    } catch (error) {

        console.error(
            "Student loading error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load students.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// SAVE ATTENDANCE
// ==========================================

async function saveAttendance() {

    const token =
        localStorage.getItem("token");


    const date =
        document.getElementById(
            "attendanceDate"
        )?.value;


    const subject =
        document.getElementById(
            "subject"
        )?.value.trim();


    const tableBody =
        document.getElementById(
            "attendanceTableBody"
        );


    // ======================================
    // VALIDATE DATE + SUBJECT
    // ======================================

    if (!date) {

        showAttendanceMessage(
            "❌ Please select a date.",
            "error"
        );

        return;
    }


    if (!subject) {

        showAttendanceMessage(
            "❌ Please enter the subject.",
            "error"
        );

        return;
    }


    if (!tableBody) {

        showAttendanceMessage(
            "❌ Student list not found.",
            "error"
        );

        return;
    }


    // ======================================
    // GET ALL STUDENTS
    // ======================================

    const rows =
        tableBody.querySelectorAll("tr");


    const attendanceList = [];


    rows.forEach(row => {

        const studentId =
            row.querySelector(
                "input[type='radio']"
            );


        if (!studentId) {
            return;
        }


        const radioButtons =
            row.querySelectorAll(
                "input[type='radio']"
            );


        let status = null;

        let studentObjectId = null;


        radioButtons.forEach(radio => {

            if (!studentObjectId) {

                const name =
                    radio.name;

                studentObjectId =
                    name.replace(
                        "attendance_",
                        ""
                    );

            }


            if (radio.checked) {

                status =
                    radio.value;

            }

        });


        if (
            studentObjectId &&
            status
        ) {

            attendanceList.push({
                student:
                    studentObjectId,

                date: date,

                subject: subject,

                status: status
            });

        }

    });


    // ======================================
    // VALIDATE ATTENDANCE
    // ======================================

    if (attendanceList.length === 0) {

        showAttendanceMessage(
            "❌ Please select Present or Absent for at least one student.",
            "error"
        );

        return;
    }


    console.log(
        "Saving attendance:",
        attendanceList
    );


    try {

        // ==================================
        // SEND EACH RECORD
        // ==================================

        let successCount = 0;


        for (
            const attendance of attendanceList
        ) {

            const response =
                await fetch(
                    `${ATTENDANCE_API}/attendance`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify({
                                student:
                                    attendance.student,

                                date:
                                    attendance.date,

                                subject:
                                    attendance.subject,

                                status:
                                    attendance.status
                            })
                    }
                );


            const data =
                await response.json();


            console.log(
                "Attendance response:",
                data
            );


            if (response.ok && data.success) {

                successCount++;

            }

        }


        // ==================================
        // SUCCESS MESSAGE
        // ==================================

        if (successCount > 0) {

            showAttendanceMessage(
                `✅ Attendance saved successfully for ${successCount} student(s).`,
                "success"
            );


            // Clear selected buttons

            document
                .querySelectorAll(
                    "#attendanceTableBody input[type='radio']"
                )
                .forEach(radio => {
                    radio.checked = false;
                });


            // Refresh records

            loadAttendanceRecords();

        } else {

            showAttendanceMessage(
                "❌ Attendance could not be saved.",
                "error"
            );

        }

    } catch (error) {

        console.error(
            "Save attendance error:",
            error
        );


        showAttendanceMessage(
            "❌ Unable to save attendance.",
            "error"
        );

    }

}


// ==========================================
// LOAD ATTENDANCE RECORDS
// ==========================================

async function loadAttendanceRecords() {

    const token =
        localStorage.getItem("token");


    const tableBody =
        document.getElementById(
            "recordsTableBody"
        );


    if (!tableBody || !token) {
        return;
    }


    try {

        const response =
            await fetch(
                `${ATTENDANCE_API}/attendance`,
                {
                    method: "GET",
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Attendance records:",
            data
        );


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load attendance records"
            );

        }


        const records =
            data.attendance || [];


        if (records.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No attendance records found.
                    </td>
                </tr>
            `;

            return;
        }


        tableBody.innerHTML =
            records
                .slice(0, 20)
                .map(record => {

                    let studentName = "-";


                    if (
                        record.student &&
                        typeof record.student ===
                            "object"
                    ) {

                        studentName =
                            record.student.name ||
                            record.student.studentId ||
                            "-";

                    }


                    let dateText = "-";


                    if (record.date) {

                        const date =
                            new Date(record.date);

                        if (
                            !isNaN(
                                date.getTime()
                            )
                        ) {

                            dateText =
                                date.toLocaleDateString(
                                    "en-IN"
                                );

                        }

                    }


                    return `
                        <tr>

                            <td>
                                ${dateText}
                            </td>

                            <td>
                                ${escapeHTML(
                                    studentName
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    record.subject || "-"
                                )}
                            </td>

                            <td>
                                <span class="status-badge">
                                    ${escapeHTML(
                                        record.status || "-"
                                    )}
                                </span>
                            </td>

                        </tr>
                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "Records loading error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Unable to load attendance records.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// MESSAGE
// ==========================================

function showAttendanceMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "attendanceMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        type === "success"
            ? "form-message success"
            : "form-message error";

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// PAGE START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadUser();

        // Automatically today's date

        const dateInput =
            document.getElementById(
                "attendanceDate"
            );


        if (dateInput) {

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];

            dateInput.value = today;

        }


        // Load ALL students

        loadStudentsForAttendance();


        // Load existing records

        loadAttendanceRecords();

    }
);