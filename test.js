const readline = require("readline");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const {hashPassword} = require("./src/utils.js")


const rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
});

let ask = (q) => new Promise((res) => rl.question(q, res));

const main = async () => {
const connection = await mysql.createConnection({
host: "localhost",
user: "root",
password: "root",
database: "prj-1",
});

while(true){
  console.log("\n🧪 TEST DB - Opzioni:");
  console.log("1. Registra nuovo utente");
  console.log("2. Visualizza tutti gli utenti");
  console.log("3. Modifica parametro di un utente");
  console.log("4. Elimina un utente");
  console.log("5. Esci\n");
  let choice = await ask("Scegli un'opzione (1 o 2 o 3): ");

  if (choice === "1") {
  let email = await ask("Inserisci email: ");
  let password = await ask("Inserisci password: ");
  let hashed = await bcrypt.hash(password, 10);

  try {
    await connection.execute(
      "INSERT INTO users (email, password, verified) VALUES (?, ?, ?)",
      [email, hashed, true]
    );
    console.log("✅ Utente registrato con successo!");
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      console.log("⚠️ Email già in uso.");
    } else {
      console.error("❌ Errore:", err.message);
    }
  }
  } else if (choice === "2") {
  let [rows] = await connection.execute("SELECT id, email, verified FROM users");
  console.log("\n📋 Utenti nel database:");
  rows.forEach((u) => {
  console.log(`- ID: ${u.id}, Email: ${u.email}, Verificato: ${u.verified}`);
  })
  } else if (choice === "3") {
  let email = await ask("Email dell'utente da modificare: ");

  let [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
  let user = rows[0];

  if (!user) {
  console.log("❌ Utente non trovato.");
  } else {
  console.log("✏️ Campi modificabili: email, password, token, verified");
  let field = await ask("Quale campo vuoi modificare? ");
  let allowed = ["email", "password", "token", "verified"];

  if (!allowed.includes(field)) {
    console.log("❌ Campo non valido.");
  } else {
    let newValue = await ask("Nuovo valore: ");

    if (field === "password") {
          newValue = await hashPassword(newValue);
    }

    if (field === "verified") {
      newValue = newValue === "true" ? true : false;
    }

    await connection.execute(`UPDATE users SET ${field} = ? WHERE email = ?`, [newValue, email]);
    console.log("✅ Campo aggiornato con successo.");
  }
  }
  } else if (choice === "4") {
    let email = await ask("Email dell'utente da eliminare: ");

    let [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
    let user = rows[0];

    if (!user) {
      console.log("❌ Utente non trovato.");
    } else {
      let confirm = await ask(`⚠️ Sei sicuro di voler eliminare ${email}? (s/N): `);
      if (confirm.toLowerCase() === "s") {
        await connection.execute("DELETE FROM users WHERE email = ?", [email]);
        console.log("🗑️ Utente eliminato con successo.");
      } else {
        console.log("❎ Operazione annullata.");
      }
    }
  }else if (choice="5"){
    break;
  }



  await connection.end();
  rl.close();
  };
}

main();