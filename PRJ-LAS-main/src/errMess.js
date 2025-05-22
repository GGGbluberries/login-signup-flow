const notFound = { success: false, message: "User not found" }
const tokenSet = { success: true, message: "Token set successfully" }
const tokenInvalidated = { success: true, message: "Token invalidated successfully" }
const resettedPassword = { success: true, message: "Reset password successful" }
const verifiedPassword = { success: true, message: "Verification status updated" }
const notVerified = { success: false, message: "Non verified email. Check your inbox or spam." }
const loggedIn = { success: true, message: "Login successful" }
const wrongPassword = { success: false,  message: "Wrong password" }
const usedEmail = { success: false, message: "Email already in use"}
const userCreated = { success: true, message: "User created successfully. Check your email for confirmation." }
const successfulSend = { success: true,  message: "Email sent successfully!" }
const successfulResend = { success: true,  message: "Email resent successfully!" }
const alreadyVerified = { success: false, message: "Email already verified"}
const emailRequired = { success: false, message: "Email required" }
const invalidLink = { success: false, message: "Invalid link" }
const passwordChanged = { success: true, message: "Password Changed" }

module.exports = {     
    tokenInvalidated,
    resettedPassword,
    verifiedPassword,
    successfulResend, 
    passwordChanged,
    alreadyVerified,
    successfulSend,
    wrongPassword,
    emailRequired,
    userCreated,
    notVerified,
    invalidLink,
    usedEmail,
    notFound,
    loggedIn,
    tokenSet,
    notFound
}