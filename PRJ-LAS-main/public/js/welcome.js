document.addEventListener("DOMContentLoaded", function () {
    const loggedUserEmail = sessionStorage.getItem("loggedUserEmail")

    if (!loggedUserEmail || loggedUserEmail === 'undefined') {
        window.location.href = '/login'
    }
    const user =  loggedUserEmail
    document.getElementById("username").textContent = user
})

document.getElementById("logoutBtn").addEventListener("click", function () {
    sessionStorage.removeItem("loggedUserEmail")
    window.location.href = "/login"
})