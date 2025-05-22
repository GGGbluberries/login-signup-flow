const resend = document.getElementById("resend")
const sentEmailP = document.getElementById('sentEmailP')

// document.addEventListener("DOMContentLoaded", () => {
//     document.getElementById("resend").click()
// })

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get("email")    

    sentEmailP.innerHTML = `Utilizza il link inviato all'indirizzo <br><a href="mailto:${email}">${email}</a><br> per verificare la tua Email`
})

resend.addEventListener("click", async (event) => {
    event.preventDefault()

    if (resend.style.pointerEvents == "none") {
        return
    }
    resend.style.pointerEvents = "none"
    resend.textContent = "Attendi..."

    const email = new URLSearchParams(window.location.search).get("email")

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
            toastr.error(data.message)
        }
    } catch (error) {
        toastr.error("Errore di connessione. Riprova.")
    }

    setTimeout(() => {
        resend.style.pointerEvents = "auto"
        resend.textContent = "Rimanda Email"
    }, 7000)
})

