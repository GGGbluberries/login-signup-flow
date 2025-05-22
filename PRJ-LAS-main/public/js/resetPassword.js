const resetPasswordPasswordField = document.getElementById('resetPasswordPassword')
const resetPasswordConfirmPasswordField = document.getElementById('resetPasswordConfirmPassword')
const toggleResetPasswordPassword = document.getElementById('toggleResetPasswordPassword')
const toggleResetPasswordConfirmPassword = document.getElementById('toggleResetPasswordConfirmPassword')
const confirmPasswordMessage = document.getElementById('confirmPasswordMessage')
const resetPasswordButton = document.querySelector('button[type="submit"]')
const form = document.getElementById("form-reset")
const resetPasswordP = document.getElementById('resetPasswordP')

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("token")

    if (!token) {
        window.location.href = "/404" //redirects to 404
        return
    }

    // hidden token input
    const hiddenTokenInput = document.createElement("input")
    hiddenTokenInput.type = "hidden"
    hiddenTokenInput.name = "token"
    hiddenTokenInput.id = "token"
    hiddenTokenInput.value = token

    form.appendChild(hiddenTokenInput)
})

document.getElementById("reset-submit").addEventListener("click", async (event) => {
    event.preventDefault()
    const password = resetPasswordPasswordField.value
    const confirmPassword = resetPasswordConfirmPasswordField.value

    if (!password || !confirmPassword) return


    const token = document.getElementById('token').value

    if (!token) {
        toastr.error("Unknown email")
        return
    }

    try {
        const response = await fetch("/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password })
        })

        const text = await response.text()
        const data = JSON.parse(text)

        if (data.success) {
            form.style.display = 'none'
            resetPasswordP.textContent = "Password changed successfully"
            resetPasswordP.style.color = "green"
        } else {
            toastr.error(data.message)
        }
    } catch (error) {
        toastr.error("Connection error, retry.")
    }
})

toggleResetPasswordPassword.addEventListener('click', () => 
    togglePasswordVisibility(resetPasswordPasswordField, toggleResetPasswordPassword)
)

toggleResetPasswordConfirmPassword.addEventListener('click', () => 
    togglePasswordVisibility(resetPasswordConfirmPasswordField, toggleResetPasswordConfirmPassword)
)

resetPasswordPasswordField.addEventListener("input", () => 
    checkPasswords(resetPasswordPasswordField, resetPasswordConfirmPasswordField, confirmPasswordMessage, resetPasswordButton)
)

resetPasswordConfirmPasswordField.addEventListener("input", () => 
    checkPasswords(resetPasswordPasswordField, resetPasswordConfirmPasswordField, confirmPasswordMessage, resetPasswordButton)
)
