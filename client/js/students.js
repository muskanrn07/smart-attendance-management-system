const API_URL = "https://smart-attendance-management-system-96xa.onrender.com"

let students = [];

// ===============================
// AUTH CHECK
// ===============================
function checkAuthentication() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}

// ===============================
// LOAD USER
// ===============================
function loadUser() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        const name = document.getElementById("userName");
        const role = document.getElementById("userRole");
        const avatar = document.getElementById("userAvatar");

        if (name) name.textContent = user.name || "User";
        if (role) role.textContent = user.role || "Faculty";
        if (avatar) {
            avatar.textContent = (user.name || "U")
                .charAt(0)
                .toUpperCase();
        }
    }
}

// ===============================
// LOAD STUDENTS
// ===============================
async function loadStudents() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/students`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load students");
        }

        students = data.students || [];

        displayStudents(students);

    } catch (error) {
        console.error("Load Students Error:", error);

        const tbody = document.getElementById("studentTableBody");

        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        Unable to load students
                    </td>
                </tr>
            `;
        }
    }
}

// ===============================
// DISPLAY STUDENTS
// ===============================
function displayStudents(list) {
    const tbody = document.getElementById("studentTableBody");

    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    No students found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map(student => `
        <tr>
            <td>${escapeHTML(student.studentId)}</td>
            <td>${escapeHTML(student.name)}</td>
            <td>${escapeHTML(student.email)}</td>
            <td>${escapeHTML(student.course)}</td>
            <td>${student.semester}</td>
            <td>${escapeHTML(student.section)}</td>
            <td>${escapeHTML(student.status || "Active")}</td>

            <td>
                <button
                    class="btn-secondary"
                    onclick="editStudent('${student._id}')">
                    Edit
                </button>

                <button
                    class="btn-danger"
                    onclick="deleteStudent('${student._id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}

// ===============================
// ADD STUDENT
// ===============================
async function addStudent(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    const student = {
        studentId: document.getElementById("studentId").value.trim(),
        name: document.getElementById("studentName").value.trim(),
        email: document.getElementById("studentEmail").value.trim(),
        course: document.getElementById("course").value.trim(),
        semester: Number(document.getElementById("semester").value),
        section: document.getElementById("section").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        status: document.getElementById("status").value
    };

    try {
        const response = await fetch(`${API_URL}/students`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(student)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to add student");
        }

        alert("Student added successfully!");

        document.getElementById("studentForm").reset();

        loadStudents();

    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

// ===============================
// SEARCH
// ===============================
function searchStudents() {
    const input = document.getElementById("studentSearch");

    if (!input) return;

    const search = input.value.toLowerCase().trim();

    const filtered = students.filter(student =>
        student.studentId.toLowerCase().includes(search) ||
        student.name.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search)
    );

    displayStudents(filtered);
}

// ===============================
// EDIT STUDENT
// ===============================
async function editStudent(id) {

    const student = students.find(s => s._id === id);

    if (!student) return;

    const name = prompt("Enter student name:", student.name);

    if (name === null) return;

    const email = prompt("Enter email:", student.email);

    if (email === null) return;

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/students/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name: name.trim(),
                email: email.trim()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to update student");
        }

        alert("Student updated successfully!");

        loadStudents();

    } catch (error) {
        alert(error.message);
    }
}

// ===============================
// DELETE STUDENT
// ===============================
async function deleteStudent(id) {

    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/students/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to delete student");
        }

        alert("Student deleted successfully!");

        loadStudents();

    } catch (error) {
        alert(error.message);
    }
}

// ======================================================
// BULK CSV UPLOAD
// ======================================================
async function uploadStudents() {

    const fileInput = document.getElementById("studentFile");

    if (!fileInput || !fileInput.files.length) {
        alert("Please select a CSV file first.");
        return;
    }

    const file = fileInput.files[0];

    if (!file.name.toLowerCase().endsWith(".csv")) {
        alert("Please select a CSV file.");
        return;
    }

    try {

        const text = await file.text();

        const studentsData = parseCSV(text);

        if (studentsData.length === 0) {
            alert("CSV file is empty.");
            return;
        }

        console.log("CSV STUDENTS:", studentsData);

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/students/bulk`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                students: studentsData
            })
        });

        const data = await response.json();

        console.log("BULK RESPONSE:", data);

        if (!response.ok) {
            throw new Error(data.message || "Bulk upload failed");
        }

        alert(
            `Upload completed!\n\n` +
            `Added: ${data.added || 0}\n` +
            `Failed/Duplicate: ${data.failed || 0}`
        );

        fileInput.value = "";

        await loadStudents();

    } catch (error) {

        console.error("BULK UPLOAD ERROR:", error);

        alert(
            "Bulk upload failed.\n\n" +
            error.message
        );
    }
}

// ======================================================
// CSV PARSER
// ======================================================
function parseCSV(text) {

    const lines = text
        .replace(/\r/g, "")
        .split("\n")
        .filter(line => line.trim() !== "");

    if (lines.length < 2) {
        return [];
    }

    const headers = lines[0]
        .split(",")
        .map(header =>
            header.trim()
                .toLowerCase()
                .replace(/['"]/g, "")
        );

    const result = [];

    for (let i = 1; i < lines.length; i++) {

        const values = splitCSVLine(lines[i]);

        if (values.length === 0) continue;

        const row = {};

        headers.forEach((header, index) => {
            row[header] = (values[index] || "")
                .trim()
                .replace(/^"|"$/g, "");
        });

        if (!row.studentid || !row.name || !row.email) {
            continue;
        }

        result.push({
            studentId: row.studentid,
            name: row.name,
            email: row.email,
            course: row.course || "BCA",
            semester: Number(row.semester) || 5,
            section: row.section || "A",
            phone: row.phone || "",
            status: row.status || "Active"
        });
    }

    return result;
}

// ======================================================
// HANDLE CSV COMMAS INSIDE QUOTES
// ======================================================
function splitCSVLine(line) {

    const result = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {

        const char = line[i];

        if (char === '"') {
            insideQuotes = !insideQuotes;
        }

        else if (char === "," && !insideQuotes) {
            result.push(current);
            current = "";
        }

        else {
            current += char;
        }
    }

    result.push(current);

    return result;
}

// ===============================
// ESCAPE HTML
// ===============================
function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ===============================
// LOGOUT
// ===============================
function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}

// ===============================
// START
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    if (!checkAuthentication()) return;

    loadUser();

    loadStudents();

    const form = document.getElementById("studentForm");

    if (form) {
        form.addEventListener("submit", addStudent);
    }

    const search = document.getElementById("studentSearch");

    if (search) {
        search.addEventListener("input", searchStudents);
    }

});