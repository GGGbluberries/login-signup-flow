const messageElement = document.getElementById("message")
const welcomeButton = document.getElementById("welcomeButton")
const newEmailButton = document.getElementById("newEmailButton")
const urlParams = new URLSearchParams(window.location.search)

document.addEventListener("DOMContentLoaded", function () {
    const status = urlParams.get("status")
    const email = urlParams.get("email")

    if (status === "success") {
        messageElement.textContent = "Email verificata con successo!"
        
        sessionStorage.setItem("loggedUserEmail", email)

        loginBtn.style.display = "inline-block"

    } else if (status === "already_verified") {
        messageElement.textContent = "Email già verificata. Puoi accedere direttamente."
        loginBtn.style.display = "inline-block"
    } else {
        welcomeButton.style.display = "none"
        messageElement.textContent = "Link non valido o scaduto."
        newEmailButton.style.display = "inline-block"
    }

    welcomeButton.addEventListener("click", function () {
        window.location.href = "/welcome"
    })
})

newEmailButton.addEventListener('click', async (event) => {
    event.preventDefault()
    const email = urlParams.get("email")

    if (!email) {
        toastr.error("Email non trovata.")
        return
    }

    try {
        const response = await fetch("/resend-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        })

        const text = await response.text()
        const data = JSON.parse(text)

        if (data.success) {
            toastr.success(data.message)
        } else {
            if (data.message === "Email già verificata") {
                messageElement.textContent = "L'Email era già stata verificata. Torna al login per accedere"
                newEmailButton.style.display = 'none'
            }
            toastr.error(data.message)
        }
    } catch (error) {
        toastr.error("Errore di connessione. Riprova.")
    }
})