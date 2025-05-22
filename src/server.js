const UsersComponent = require("./UsersComponent")
const EmailComponent = require("./EmailComponent")
const configs = require("./configs")
const jwt = require('jsonwebtoken')
const express = require("express")
const join = require("path").join
const { hashPassword } = require("./utils");
const {
    notFound, 
    emailRequired, 
    alreadyVerified, 
    successfulResend, 
    successfulSend, 
    invalidLink, 
    passwordChanged 
        } = require("./errMess")


const app = new express()
// const usersComponent = new UsersComponent("./state.json")
const usersComponent = new UsersComponent({
    host: configs.DB_HOST,
    user: configs.DB_USER,
    password: configs.DB_PASSWORD,
    database: configs.DB,
    waitForConnections: true,
    connectionLimit: 10,
})
const emailComponent = new EmailComponent()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(join(__dirname, "../public")))

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "../public/html/home.html"))
})

app.get("/login", (req, res) => {
    res.sendFile(join(__dirname, "../public/html/login.html"))
})

app.post("/login", async (req, res) => {
    console.log("BODY:", req.body)
    // const hashedPassword = await hashPassword(req.body.password)
    console.log(req.body.email, req.body.password)
    const result = await usersComponent.login(req.body.email, req.body.password)
    
    if (result.success) {
        console.log("gg")
        res.json(result)
    } else {
        res.status(400).json(result)
    }
})

app.get("/signup", (req, res) => {
    res.sendFile(join(__dirname, "../public/html/signup.html"))
})

app.post("/signup", async (req, res) => {
    const result = await usersComponent.create(req.body)
    if (result.success) {
        const user = await result.user
        console.log(user)
        console.log("first mail: ", user.email)
        await usersComponent.setToken(user.email)
        const userReloaded = await usersComponent.getUser(user.email)
        emailComponent.sendEmail(user.email, "verify-email", userReloaded.token)
        res.redirect(`/signup-confirmation?email=${encodeURIComponent(user.email)}`)
    } else {
        res.json(result)
    }
})

app.get("/welcome", (req, res) => {
    res.sendFile(join(__dirname, "../public/html/welcome.html"))
})

app.get('/signup-confirmation', async (req, res) => {
    res.sendFile(join(__dirname, "../public/html/signupConfirmation.html"))
})

app.get('/verify-email', async (req, res) => {
    // const identification = req.query.token
    // const idDecoded = jwt.verify(identification, configs.JWT_SECRET) 
    // const email = idDecoded.email
    // console.log("saaaaaaaa", email)
    // const user = await usersComponent.getUser(email)

    try {
        // const token= user.token
        // const decoded = jwt.verify(token, configs.JWT_SECRET) 
        // // const email = decoded.email
        // // const email = req.query
        // console.log("seeeeeee", token)
        // console.log("sooooooo", decoded)
        // const user = await usersComponent.getUser(email)
        const token = req.query.token
        const decoded = jwt.verify(token, configs.JWT_SECRET) 
        const email = decoded.email
        const user = await usersComponent.getUser(email)

        console.log(user)
        console.log(token)

        if (!user) {
            return res.redirect(`/verified-email?status=invalid`)
        }

        if (decoded.verified) {
            usersComponent.invalidateUserToken(email)
            return res.redirect(`/verified-email?status=already_verified&email=${encodeURIComponent(user.email)}`)
        }

        if (user.token != token) {
            return res.redirect(`/verified-email?status=invalid&email=${encodeURIComponent(user.email)}`)
        }

        usersComponent.updateVerificationStatus(email)

        return res.redirect(`/verified-email?status=success&email=${encodeURIComponent(user.email)}`)
    } catch (error) {        // get email from invalid token
        let email = null
        if (error.name === "TokenExpiredError") {
            const decoded = jwt.decode(token)  // Decode token without checking
            email = decoded?.email
        }

        if (email) {   //New token and new mail
            const newToken = jwt.sign({ email }, configs.JWT_SECRET, { expiresIn: '1h' })
            // usersComponent.setUserToken(email, newToken)
            usersComponent.setToken(email, newToken)
            console.log("---", user.email)
            emailComponent.sendEmail(email, "verify-email", newToken)

            return res.redirect(`/verified-email?status=resent&email=${encodeURIComponent(email)}`)
        }

        return res.redirect(`/verified-email?status=invalid`)
    }
})

app.get("/verified-email", (req, res) => {
    res.sendFile(join(__dirname, "../public/html/verifiedEmail.html"))
})

app.post("/resend-email", async (req, res) => {
    const { email } = req.body
    console.log("-", email)
    if (!email) res.status(400).json(emailRequired)
    
    const user = await usersComponent.getUser(email)
    console.log("--", user)

    if (!user) res.status(404).json(notFound)
    if (user.verified) res.status(400).json(alreadyVerified)
    
    successfulResend.user = user
    // usersComponent.setUserToken(user.email)
    // ? await usersComponent.setToken(user.email)
    console.log("---", user.email)
    emailComponent.sendEmail(user.email, "verify-email", user.token)

    return res.json(successfulResend)
})

app.get('/forgot-password', async (req, res) => {
    res.sendFile(join(__dirname, "../public/html/forgotPassword.html"))
})

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body

    if (!email) res.status(400).json(emailRequired)
    const user = await usersComponent.getUser(email)

    if (!user || !user?.verified) res.status(400).json(notFound)
    
    // usersComponent.setUserToken(email)
    usersComponent.setToken(email)
    successfulSend.user = user
    console.log("---", user.email)
    emailComponent.sendEmail(email, "reset-password", user.token)

    return res.json(successfulSend)
})

app.get('/reset-password', async (req, res) => {
    const { token } = req.query

    try {
        const decoded = jwt.verify(token, configs.JWT_SECRET)
        const email = decoded.email

        const user = await usersComponent.getUser(email)

        if (!user) res.status(404).json(notFound)

        if (user.token !== token) {
            return res.status(400).json(invalidLink)
        }

        res.sendFile(join(__dirname, "../public/html/resetPassword.html"))
    } catch (error) {
        res.status(400).send('Invalid link')
    }
})

app.post('/reset-password', async (req, res) => {
    const { token, password } = req.body

    try {
        const decoded = jwt.verify(token, configs.JWT_SECRET)
        const email = decoded.email
        const user = await usersComponent.getUser(email)

        if (!user) res.status(400).json(notFound)

        if (user.token !== token) res.status(400).json(invalidLink)

        usersComponent.updateUserPassword(email, password)
        res.json(passwordChanged)

    } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid link" })
    }
})

app.use((req, res) => {res.sendFile(join(__dirname, "../public/html/404.html"))}) //404 endpoint not found

// app.listen(configs.PORT, configs.SITE_URL, () => console.log("server listening on port", configs.PORT))
app.listen(configs.PORT, () => console.log("server listening on port", configs.PORT))