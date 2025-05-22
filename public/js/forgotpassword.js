const form = document.getElementById('forgot-password-form')
const messageP = document.getElementById('messageP')
const resendEmailP = document.getElementById('resendEmailP')
const resend = document.getElementById('resend')
const newEmailP = document.getElementById('newEmailP')
const title = document.getElementById('title')

const urlParams = new URLSearchParams(window.location.search)
const emailFromURL = urlParams.get("email")
document.getElementById('email').value = emailFromURL



async function sendEmail (event) {
    event.preventDefault() // prevents the page refresh
    const email = document.getElementById("email").value

    if (!email) {
        toastr.error("Insert a valid email.")
        return
    }

    try {
        const response = await fetch("/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        })

        const text = await response.text()
        const data = JSON.parse(text)

        if (data.success) {
            form.style.display = 'none'
            resendEmailP.style.display = 'block'
            newEmailP.style.display = 'block'
            title.innerText = "Your email was sent successfully"
            messageP.innerHTML = `Use the link sent to <br><a href="mailto:${email}">${email}</a><br> to reset your password`
            toastr.success(data.message || "Email sent successfully")
        } else {
            toastr.error(data.message || "Error while sending the email")
        }
    } catch (error) {
        toastr.error("Connection error, retry")
    }
}

form.addEventListener("submit", sendEmail)

resendEmailP.addEventListener("click", (event) => {
    if (resend.style.pointerEvents == "none") {
        return
    }
    sendEmail(event)
    resend.style.pointerEvents = "none"
    resend.textContent = "Loading..."

    setTimeout(() => {
        resend.style.pointerEvents = "auto"
        resend.textContent = "Resend email"
    }, 7000)
})