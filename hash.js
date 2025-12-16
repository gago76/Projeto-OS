const bcrypt = require("bcryptjs");

const senha = "admin123";
const saltRounds = 12;

bcrypt.hash(senha, saltRounds, (err, hash) => {
  if (err) {
    console.error("Erro ao gerar hash:", err);
    return;
  }
  console.log("Senha original:", senha);
  console.log("Novo hash gerado:", hash);
});
