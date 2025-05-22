// const fs = require("fs")
// const bcrypt = require("bcrypt")
// const { generateToken, hashPassword } = require("./utils")
// const {
//     tokenInvalidated,
//     resettedPassword,
//     verifiedPassword,
//     wrongPassword,
//     userCreated,
//     notVerified,
//     usedEmail,
//     notFound,
//     loggedIn,
//     tokenSet            
//     } = require("./errMess")

// class UsersComponent {
//     constructor(statePath) {
//         this.users = []
//         this.statePath = statePath
//         try {
//             this.users = JSON.parse(fs.readFileSync(statePath, "utf-8"))
//         } catch(err) {
//             console.log(err.message)
//             this.serialize()
//         }
//     }

//     serialize() {
//         fs.writeFileSync(this.statePath, JSON.stringify(this.users, null, 2))
//     }

//     getUser(email) {
//         return this.users.find(u => u.email === email)
//     }

//     setToken(email) {
//         const user = this.getUser(email)
//         if (!user) return notFound

//         user.token = generateToken(email)
//         this.serialize()

//         return tokenSet
//     }

//     invalidateUserToken(email) {
//         const user = this.getUser(email)
//         if (!user) return notFound

//         user.token = null
//         this.serialize()

//         return tokenInvalidated
//     }

//     async updateUserPassword(email, password) {
//         const user = this.getUser(email)
//         if (!user) return notFound

//         user.password = await hashPassword(password)
//         this.invalidateUserToken(email)
//         this.serialize()
        
//         return resettedPassword
//     }
    
//     updateVerificationStatus(email, verified) {
//         const user = this.getUser(email)
//         if (!user) return notFound

//         user.verified = verified
//         user.token = null
//         this.serialize()  

//         return verifiedPassword
//     }

//     async create(data) {
//         const { email, password } = data
//         if (this.getUser(email)) {
//             return usedEmail
//         }

//         const user = {
//             email, 
//             password: await hashPassword(password),
//             token : null,
//             verified: false
//         }
//         userCreated.user = user
//         this.users.push(user)
//         this.serialize()
        
//         return userCreated
//     }

//     async login(email, password) {
//         const user = this.getUser(email)
//         wrongPassword.user = user
//         notVerified.user = user
//         loggedIn.user = user

//         if (!user) return notFound

//         if (!user.verified) return notVerified

//         if (await bcrypt.compare(password, Buffer.from(user.password, 'base64').toString('utf-8'))) {
//             return loggedIn
//         }

//         return wrongPassword
//     }

// }

// module.exports = UsersComponent






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
// host= config.SITE_HOST
// user= config.DB_USER
// password= config.DB_PASSWORD
// database= config.DB
// console.log(configs.SITE_HOST)
// console.log(configs.DB_USER)
// console.log(configs.DB_PASSWORD)
// console.log(configs.DB)


class UsersComponent {
  // constructor() {
  //   this.pool = mysql.createPool({
  //     host: configs.DB_HOST,
  //     user: configs.DB_USER,
  //     password: configs.DB_PASSWORD,
  //     database: configs.DB,
  //     waitForConnections: true,
  //     connectionLimit: 10,
  //   })
  // }
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

  // const hashed = await hashPassword(password);
  const hashed = await hashPassword(password);

  // const [result] = 
  await this.pool.query(
    "INSERT INTO pear_users (email, password, verified, token) VALUES (?, ?, ?, ?)",
    [email, hashed, false, null]
  );

  const user = this.getUser(email)
  this.setToken(email)
  userCreated.user = user;
  return userCreated;
  }

  // async login(email, password) {
  // const user = await this.getUser(email);
  // wrongPassword.user = user;
  // notVerified.user = user;
  // loggedIn.user = user;

  // if (!user) return notFound;

  // if (!user.verified) return notVerified;

  // const match = await bcrypt.compare(password, user.password);
  // if (match) return loggedIn;

  // return wrongPassword;
  // }

  async login(email, password) {
      const user = await this.getUser(email)
      console.log(user)

      if (!user) return { success: false, message: "User not found", user: null }
      if (!user.verified) {return { success: false, message: "User not verified", user }}

      console.log(await hashPassword(password), "----", user.password)
      const passwordMatch = await bcrypt.compare(password, user.password)
      
      if (passwordMatch) {
          return { success: true, message: "Logged in", user }
      } else {
          return { success: false, message: "Wrong password", user }
      }
  }

  }

module.exports = UsersComponent;