const loginForm = document.getElementById("loginForm")
const toggleLoginPassword = document.getElementById('toggleLoginPassword')
const loginPasswordField = document.getElementById('loginPassword')
const loginEmailField = document.getElementById('loginEmail')
const errorMessage = document.getElementById('errorMessage')

function togglePassword() {
    let passwordField = document.getElementById("password")
    let toggleIcon = document.querySelector(".toggle-password i")

    if (passwordField.type === "password") {
        passwordField.type = "text"
        toggleIcon.classList.remove("fa-eye")
        toggleIcon.classList.add("fa-eye-slash")
    } else {
        passwordField.type = "password"
        toggleIcon.classList.remove("fa-eye-slash")
        toggleIcon.classList.add("fa-eye")
    }
}

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault()

    const email = loginEmailField.value
    const password = loginPasswordField.value
    console.log(email, password)

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })

        const data = await response.json()//.stringify()

        if (data.success) {   //JDJiJDEwJHhFN1RCeS9EWlVoSzlDM2diMW0yOXVEZU9zQzJOc29XWW5CeVpEYjN
            sessionStorage.setItem("loggedUserEmail", data.user.email)
            window.location.href = "/welcome"
        } else {
            errorMessage.style.opacity = 1
            // console.log(data.user.verified, "---", data.user?.verified)
            console.log(data)
            if (!data.user || data.user?.verified) {
                errorMessage.textContent = "Wrong email or password"
                loginPasswordField.classList.add('input-error')
                loginEmailField.classList.add('input-error')
            } else {
                errorMessage.textContent = "Non verified email"
                loginEmailField.classList.add('input-error')
            }
        }
    } catch (error) {
        console.error("Error while logging in:", error)
        toastr.error("Unexpected error")
    }
})

toggleLoginPassword.addEventListener('click', () => 
    togglePasswordVisibility(loginPasswordField, toggleLoginPassword)
)

loginPasswordField.addEventListener('input', () => {
    loginEmailField.classList.remove('input-error')
    loginPasswordField.classList.remove('input-error')
    errorMessage.style.opacity = 0
})

loginEmailField.addEventListener('input', () => {
    loginEmailField.classList.remove('input-error')
    loginPasswordField.classList.remove('input-error')
    errorMessage.style.opacity = 0
})


loginEmailField.addEventListener("input", () => { //sends the email to the forgot-password page
        const forgotPasswordLink = document.getElementById("forgotPasswordLink")
        const email = loginEmailField.value
        if (email.trim() !== "") {
            forgotPasswordLink.href = `forgot-password?email=${encodeURIComponent(email)}`
        } else {
            forgotPasswordLink.href = "forgot-password"; // Reset if empty
        }
    })

