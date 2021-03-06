const bcrypt = require("bcrypt");

function hashPassword(str) {
  console.log(str)
  return bcrypt.hashSync(str, 5);
}

function comparePassword(pass, hash) {
  return bcrypt.compareSync(pass, hash);
}

module.exports = {
  hashPassword,
  comparePassword
};
