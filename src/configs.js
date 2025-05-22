require("dotenv").config()

const {
    EMAIL,
    EMAIL_PASSWORD,
    SALT_ROUNDS,
    JWT_SECRET,
    DB_HOST,
    PORT,
    APP_NAME,
    DB_USER,
    DB_PASSWORD,
    DB
} = process.env

module.exports = { 
    EMAIL,
    EMAIL_PASSWORD,
    SALT_ROUNDS,
    JWT_SECRET,
    DB_HOST,
    PORT,
    APP_NAME,
    DB_USER,
    DB_PASSWORD,
    DB
}