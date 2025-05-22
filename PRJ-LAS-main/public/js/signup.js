const signupPasswordField = document.getElementById('signupPassword')
const signupEmailField = document.getElementById('signupEmail')
const signupConfirmPasswordField = document.getElementById('signupConfirmPassword')
const toggleSignupPassword = document.getElementById('toggleSignupPassword')
const toggleSignupConfirmPassword = document.getElementById('toggleSignupConfirmPassword')
const confirmPasswordMessage = document.getElementById('confirmPasswordMessage')
const signupButton = document.querySelector('button[type="submit"]')
const signupForm = document.getElementById('signupForm')
const errorMessage = document.getElementById('errorMessage')

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    const email = signupEmailField.value
    const password = signupPasswordField.value

    try {

        const response = await fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })

        if (response.ok) {
            window.location.href = `/signup-confirmation?email=${encodeURIComponent(email)}`
        } else {
            errorMessage.style.opacity = 1
            signupEmailField.classList.add('input-error')
        }
    } catch (error) {
        console.error("Errore durante il signup:", error)
        toastr.error("Errore inaspettato")
    }
})

signupEmailField.addEventListener('input', () => {
    signupEmailField.classList.remove('input-error')
    errorMessage.style.display = 0
})

toggleSignupPassword.addEventListener('click', () => 
    togglePasswordVisibility(signupPasswordField, toggleSignupPassword)
)

toggleSignupConfirmPassword.addEventListener('click', () => 
    togglePasswordVisibility(signupConfirmPasswordField, toggleSignupConfirmPassword)
)

signupPasswordField.addEventListener("input", () => 
    checkPasswords(signupPasswordField, signupConfirmPasswordField, confirmPasswordMessage, signupButton)
)

signupConfirmPasswordField.addEventListener("input", () => 
    checkPasswords(signupPasswordField, signupConfirmPasswordField, confirmPasswordMessage, signupButton)
)
