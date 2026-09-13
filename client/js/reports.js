const REPORT_API = "http://localhost:5000/api";

checkAuthentication();


// User information

const storedUser = localStorage.getItem("user");

if (storedUser) {

  const user = JSON.parse(storedUser);

  document.getElementById("userName").textContent =
    user.name || "User";

  document.getElementById("userRole").textContent =
    user.role || "Faculty";

  document.getElementById("userAvatar").textContent =
    (user.name || "U").charAt(0).toUpperCase();
}



// Load Reports

async function loadReports() {

  const token = localStorage.getItem("token");

  try {

    const response = await fetch(
      `${REPORT_API}/reports`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message || "Unable to load reports"
      );

    }


    const students =
      data.students || data.report || [];


    displayReports(students);


  } catch (error) {

    console.error("Report Error:", error);

    document.getElementById("reportTableBody").innerHTML = `
      <tr>
        <td colspan="7"
            style="text-align:center;color:red;">
          Unable to load reports
        </td>
      </tr>
    `;

  }

}



// Display reports

function displayReports(students) {

  const tableBody =
    document.getElementById("reportTableBody");


  let totalClasses = 0;
  let totalPresent = 0;
  let totalAbsent = 0;


  if (students.length === 0) {

    tableBody.innerHTML = `
      <tr>
        <td colspan="7"
            style="text-align:center;">
          No attendance data available yet.
        </td>
      </tr>
    `;

    updateSummary(0, 0, 0, 0);

    return;
  }


  tableBody.innerHTML =
    students.map(student => {

      const total =
        student.totalClasses || 0;

      const present =
        student.present || 0;

      const absent =
        student.absent || 0;


      const percentage =
        total > 0
          ? ((present / total) * 100).toFixed(1)
          : 0;


      totalClasses += total;
      totalPresent += present;
      totalAbsent += absent;


      let status = "Good";


      if (percentage < 75) {
        status = "Low";
      }


      return `

        <tr>

          <td>
            ${student.studentId || "-"}
          </td>

          <td>
            ${student.name || "-"}
          </td>

          <td>
            ${total}
          </td>

          <td>
            ${present}
          </td>

          <td>
            ${absent}
          </td>

          <td>
            <strong>
              ${percentage}%
            </strong>
          </td>

          <td>
            <span class="status-badge">
              ${status}
            </span>
          </td>

        </tr>

      `;

    }).join("");


  const overallPercentage =
    totalClasses > 0
      ? ((totalPresent / totalClasses) * 100).toFixed(1)
      : 0;


  updateSummary(
    students.length,
    totalClasses,
    totalPresent,
    totalAbsent
  );


  document.getElementById(
    "overallPercentage"
  ).textContent =
    `${overallPercentage}%`;


  document.getElementById(
    "overallProgress"
  ).style.width =
    `${overallPercentage}%`;

}



// Update summary cards

function updateSummary(
  totalStudents,
  totalClasses,
  totalPresent,
  totalAbsent
) {

  document.getElementById(
    "totalStudents"
  ).textContent =
    totalStudents;


  document.getElementById(
    "totalClasses"
  ).textContent =
    totalClasses;


  document.getElementById(
    "totalPresent"
  ).textContent =
    totalPresent;


  document.getElementById(
    "totalAbsent"
  ).textContent =
    totalAbsent;

}



// Load low attendance

async function loadLowAttendance() {

  const token = localStorage.getItem("token");

  const tableBody =
    document.getElementById(
      "lowAttendanceBody"
    );


  try {

    const response = await fetch(
      `${REPORT_API}/reports/low-attendance`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to load low attendance"
      );

    }


    const students =
      data.students ||
      data.lowAttendance ||
      data.report ||
      [];


    if (students.length === 0) {

      tableBody.innerHTML = `
        <tr>
          <td colspan="4"
              style="text-align:center;">
            ✓ No students with low attendance.
          </td>
        </tr>
      `;

      return;
    }


    tableBody.innerHTML =
      students.map(student => {

        const percentage =
          student.attendancePercentage ??
          student.percentage ??
          0;


        return `

          <tr>

            <td>
              ${student.studentId || "-"}
            </td>

            <td>
              ${student.name || "-"}
            </td>

            <td>
              <strong>
                ${Number(percentage).toFixed(1)}%
              </strong>
            </td>

            <td>
              75%
            </td>

          </tr>

        `;

      }).join("");


  } catch (error) {

    console.error(
      "Low Attendance Error:",
      error
    );


    tableBody.innerHTML = `
      <tr>
        <td colspan="4"
            style="text-align:center;color:red;">
          Unable to load low attendance data
        </td>
      </tr>
    `;

  }

}



// Start

loadReports();

loadLowAttendance();
// AI Attendance Risk Prediction

async function loadAIRisk() {

  const token = localStorage.getItem("token");

  const tableBody =
    document.getElementById("aiRiskBody");

  tableBody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:center;">
        🤖 AI is analyzing attendance...
      </td>
    </tr>
  `;

  try {

    const response = await fetch(
      `${REPORT_API}/ai/attendance-risk`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "AI prediction failed"
      );
    }

    const predictions =
      data.predictions || [];

    if (predictions.length === 0) {

      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;">
            No attendance data available.
          </td>
        </tr>
      `;

      return;
    }

    tableBody.innerHTML =
      predictions.map(student => {

        let riskClass = "";

        if (student.risk === "High Risk") {
          riskClass = "high-risk";
        }
        else if (student.risk === "Medium Risk") {
          riskClass = "medium-risk";
        }
        else {
          riskClass = "safe-risk";
        }

        return `
          <tr>

            <td>
              ${student.studentId}
            </td>

            <td>
              ${student.name}
            </td>

            <td>
              <strong>
                ${student.attendancePercentage}%
              </strong>
            </td>

            <td>
              <span class="risk-badge ${riskClass}">
                ${student.risk}
              </span>
            </td>

            <td>
              ${student.recommendation}
            </td>

          </tr>
        `;

      }).join("");

  } catch (error) {

    console.error("AI Error:", error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="5"
            style="text-align:center;color:red;">
          ❌ ${error.message}
        </td>
      </tr>
    `;
  }
}