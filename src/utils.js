const jwt = require('jsonwebtoken')
const configs = require("./configs")
const bcrypt = require("bcrypt")
const SR = parseInt(configs.SALT_ROUNDS)

function generateToken(email) {
    return jwt.sign({ email }, configs.JWT_SECRET, { expiresIn: '1h' })
}

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, SR)
    return hashedPassword
}

function replaceElements(replacements, template){
    Object.keys(replacements).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        template = template.replace(regex, replacements[key])
    })
    return template
}

function urlOf(root, token){
    return `http://${configs.DB_HOST}:${configs.PORT}/${root}?token=${token}`
}

function emailFileOf(root){
    if (root === 'verify-email')  {
        return 'confirmation_email' 
    }
    return 'reset_password_email'
}


module.exports = {
    replaceElements,
    generateToken,
    hashPassword,
    emailFileOf,
    urlOf
}