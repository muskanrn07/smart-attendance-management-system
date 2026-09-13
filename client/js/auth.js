// ======================================
// SMART ATTENDANCE SYSTEM
// AUTHENTICATION
// ======================================

const API_URL = "https://smart-attendance-management-system-96xa.onrender.com"


// ======================================
// SHOW LOGIN
// ======================================

function showLogin() {

    const loginSection =
        document.getElementById("loginSection");

    const registerSection =
        document.getElementById("registerSection");

    if (loginSection) {
        loginSection.style.display = "block";
    }

    if (registerSection) {
        registerSection.style.display = "none";
    }

}


// ======================================
// SHOW REGISTER
// ======================================

function showRegister() {

    const loginSection =
        document.getElementById("loginSection");

    const registerSection =
        document.getElementById("registerSection");

    if (loginSection) {
        loginSection.style.display = "none";
    }

    if (registerSection) {
        registerSection.style.display = "block";
    }

}


// ======================================
// MESSAGE FUNCTION
// ======================================

function showMessage(elementId, message, type) {

    const element =
        document.getElementById(elementId);

    // If message element doesn't exist
    // simply stop instead of causing an error

    if (!element) {
        console.log(message);
        return;
    }

    element.textContent = message;

    element.className =
        "form-message " + type;

}


// ======================================
// LOGIN
// ======================================

function setupLoginForm() {

    const loginForm =
        document.getElementById("loginForm");

    // Dashboard doesn't have loginForm
    // so simply return

    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    showMessage(
                        "loginMessage",
                        data.message ||
                            "Login failed",
                        "error"
                    );

                    return;
                }


                // Save token

                localStorage.setItem(
                    "token",
                    data.token
                );


                // Save user

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );


                showMessage(
                    "loginMessage",
                    "Login successful! Redirecting...",
                    "success"
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "dashboard.html";

                    },
                    700
                );


            } catch (error) {

                showMessage(
                    "loginMessage",
                    "Unable to connect to server.",
                    "error"
                );

                console.error(
                    "Login Error:",
                    error
                );

            }

        }
    );

}


// ======================================
// REGISTER
// ======================================

function setupRegisterForm() {

    const registerForm =
        document.getElementById("registerForm");

    // Dashboard doesn't have registerForm

    if (!registerForm) {
        return;
    }


    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("registerName")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("registerEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("registerPassword")
                    .value;

            const role =
                document
                    .getElementById("registerRole")
                    .value;


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                password: password,
                                role: role
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    showMessage(
                        "registerMessage",
                        data.message ||
                            "Registration failed",
                        "error"
                    );

                    return;
                }


                showMessage(
                    "registerMessage",
                    "Account created successfully! Please login.",
                    "success"
                );


                registerForm.reset();


                setTimeout(
                    function () {

                        showLogin();

                    },
                    1200
                );


            } catch (error) {

                showMessage(
                    "registerMessage",
                    "Unable to connect to server.",
                    "error"
                );

                console.error(
                    "Register Error:",
                    error
                );

            }

        }
    );

}


// ======================================
// CHECK LOGIN
// ======================================

function checkAuthentication() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

    }

}


// ======================================
// LOGOUT
// ======================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href =
        "login.html";

}


// ======================================
// START AUTH
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupLoginForm();

        setupRegisterForm();

    }
);