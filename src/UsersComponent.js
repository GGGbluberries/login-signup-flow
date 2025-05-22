const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { generateToken, hashPassword } = require("./utils");
const {
tokenInvalidated,
resettedPassword,
verifiedPassword,
wrongPassword,
userCreated,
notVerified,
usedEmail,
notFound,
loggedIn,
tokenSet,
} = require("./errMess");

const configs = require("./configs")
require("dotenv").config();


class UsersComponent {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  async getUser(email) {
  const [rows] = await this.pool.query('SELECT * FROM pear_users WHERE email = ?', [email]);
  return rows[0] || null;
  }

  async setToken(email) {
  const user = await this.getUser(email);
  if (!user) return notFound;
  const token = generateToken(email);
  await this.pool.query("UPDATE pear_users SET token = ? WHERE email = ?", [token, email]);

  return tokenSet;
  }

  async invalidateUserToken(email) {
  const user = await this.getUser(email);
  if (!user) return notFound;
  await this.pool.query("UPDATE pear_users SET token = NULL WHERE email = ?", [email]);
  return tokenInvalidated;
  }

  async updateUserPassword(email, password) {
  const user = await this.getUser(email);
  if (!user) return notFound;


  const hashed = await hashPassword(password);
  await this.pool.query("UPDATE pear_users SET password = ?, token = NULL WHERE email = ?", [hashed, email]);

  return resettedPassword;
  }

  async updateVerificationStatus(email) {
  const user = await this.getUser(email);
  if (!user) return notFound;
  await this.pool.query("UPDATE pear_users SET verified = ?, token = NULL WHERE email = ?", [true, email]);
  return verifiedPassword;
  }

  async create(data) {
  const { email, password } = data;
  const existing = await this.getUser(email);
  if (existing) return usedEmail;

  const hashed = await hashPassword(password);

  await this.pool.query(
    "INSERT INTO pear_users (email, password, verified, token) VALUES (?, ?, ?, ?)",
    [email, hashed, false, null]
  );

  const user = this.getUser(email)
  this.setToken(email)
  userCreated.user = user;
  return userCreated;
  }

  async login(email, password) {
      const user = await this.getUser(email)

      if (!user) return { success: false, message: "User not found", user: null }
      if (!user.verified) return { success: false, message: "User not verified", user }

      const passwordMatch = await bcrypt.compare(password, user.password)
      
      if (passwordMatch) {
          return { success: true, message: "Logged in", user }
      } else {
          return { success: false, message: "Wrong password", user }
      }
  }

  }

module.exports = UsersComponent;