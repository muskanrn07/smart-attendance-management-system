const DASHBOARD_API = "https://smart-attendance-management-system-96xa.onrender.com"


// ==========================================
// CHECK LOGIN
// ==========================================

if (typeof checkAuthentication === "function") {
    checkAuthentication();
}


// ==========================================
// LOAD USER
// ==========================================

function loadUserInfo() {

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        return;
    }

    try {

        const user = JSON.parse(storedUser);

        const userName = document.getElementById("userName");
        const userRole = document.getElementById("userRole");
        const welcomeName = document.getElementById("welcomeName");

        if (userName) {
            userName.textContent = user.name || "User";
        }

        if (userRole) {
            userRole.textContent = user.role || "Faculty";
        }

        if (welcomeName) {
            welcomeName.textContent = user.name || "User";
        }

    } catch (error) {

        console.error("User information error:", error);

    }
}


// ==========================================
// LOAD STUDENTS
// ==========================================

async function loadStudents() {

    const token = localStorage.getItem("token");

    const studentBody =
        document.getElementById("dashboardStudentBody");

    if (!studentBody) {
        console.error("dashboardStudentBody not found");
        return;
    }

    if (!token) {

        studentBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Please login again.
                </td>
            </tr>
        `;

        return;
    }

    try {

        console.log("Loading students...");

        const response = await fetch(
            `${DASHBOARD_API}/students`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log("STUDENT DATA:", data);

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to load students"
            );

        }

        const students = data.students || [];

        // Total students
        const totalStudents =
            document.getElementById("totalStudents");

        if (totalStudents) {
            totalStudents.textContent = students.length;
        }


        // No students
        if (students.length === 0) {

            studentBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No students found.
                    </td>
                </tr>
            `;

            return;
        }


        // ======================================
        // SHOW STUDENTS
        // ======================================

        studentBody.innerHTML = students
            .slice(0, 10)
            .map(student => {

                return `
                    <tr>

                        <td>
                            ${escapeHTML(student.studentId || "-")}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(student.name || "-")}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(student.email || "-")}
                        </td>

                        <td>
                            ${escapeHTML(student.course || "-")}
                        </td>

                        <td>
                            ${student.semester || "-"}
                        </td>

                        <td>
                            ${escapeHTML(student.section || "-")}
                        </td>

                        <td>
                            <span class="status-badge">
                                ${escapeHTML(student.status || "Active")}
                            </span>
                        </td>

                    </tr>
                `;

            })
            .join("");


        console.log(
            "Students displayed:",
            students.length
        );

    } catch (error) {

        console.error(
            "Student loading error:",
            error
        );

        studentBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Error loading students.
                </td>
            </tr>
        `;

    }
}


// ==========================================
// LOAD ATTENDANCE
// ==========================================

async function loadAttendance() {

    const token = localStorage.getItem("token");

    const attendanceBody =
        document.getElementById("recentAttendanceBody");

    if (!attendanceBody) {
        return;
    }

    if (!token) {
        return;
    }

    try {

        const response = await fetch(
            `${DASHBOARD_API}/attendance`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log(
            "ATTENDANCE DATA:",
            data
        );

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Attendance loading failed"
            );

        }

        const attendance =
            data.attendance || [];


        // Total records

        const totalAttendance =
            document.getElementById("totalAttendance");

        if (totalAttendance) {
            totalAttendance.textContent =
                attendance.length;
        }


        // Present

        const presentCount =
            attendance.filter(
                record => record.status === "Present"
            ).length;


        // Absent

        const absentCount =
            attendance.filter(
                record => record.status === "Absent"
            ).length;


        const presentElement =
            document.getElementById("presentCount");

        const absentElement =
            document.getElementById("absentCount");


        if (presentElement) {
            presentElement.textContent =
                presentCount;
        }


        if (absentElement) {
            absentElement.textContent =
                absentCount;
        }


        // No attendance

        if (attendance.length === 0) {

            attendanceBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No attendance records found.
                    </td>
                </tr>
            `;

            return;
        }


        // Recent attendance

        attendanceBody.innerHTML =
            attendance
                .slice(0, 10)
                .map(record => {

                    let studentName = "-";

                    if (
                        record.student &&
                        typeof record.student === "object"
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

                        if (!isNaN(date.getTime())) {

                            dateText =
                                date.toLocaleDateString("en-IN");

                        }

                    }


                    return `
                        <tr>

                            <td>
                                ${dateText}
                            </td>

                            <td>
                                ${escapeHTML(studentName)}
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
            "Attendance loading error:",
            error
        );

        attendanceBody.innerHTML = `
            <tr>
                <td colspan="4">
                    No attendance records available.
                </td>
            </tr>
        `;

    }
}


// ==========================================
// AI ATTENDANCE RISK
// ==========================================

async function loadAIRiskSummary() {

    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {

        const response = await fetch(
            `${DASHBOARD_API}/ai/attendance-risk`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log(
            "AI RISK DATA:",
            data
        );

        if (!response.ok || !data.success) {
            return;
        }

        const predictions =
            data.predictions || [];


        let highRisk = 0;
        let mediumRisk = 0;
        let safeRisk = 0;


        predictions.forEach(student => {

            if (student.risk === "High Risk") {
                highRisk++;
            }

            else if (student.risk === "Medium Risk") {
                mediumRisk++;
            }

            else if (student.risk === "Safe") {
                safeRisk++;
            }

        });


        const highRiskElement =
            document.getElementById("highRiskCount");

        const mediumRiskElement =
            document.getElementById("mediumRiskCount");

        const safeRiskElement =
            document.getElementById("safeRiskCount");


        if (highRiskElement) {
            highRiskElement.textContent =
                highRisk;
        }

        if (mediumRiskElement) {
            mediumRiskElement.textContent =
                mediumRisk;
        }

        if (safeRiskElement) {
            safeRiskElement.textContent =
                safeRisk;
        }

    } catch (error) {

        console.error(
            "AI Risk Error:",
            error
        );

    }
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
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// START DASHBOARD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("Dashboard loaded");

        loadUserInfo();

        // Student list independent
        loadStudents();

        // Attendance independent
        loadAttendance();

        // AI independent
        loadAIRiskSummary();

    }
);