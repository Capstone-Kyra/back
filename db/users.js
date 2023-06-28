const client = require("./index");

async function createUser(name, password, email, isAdmin) {
  try {
    const data = await client.query(
      `
    INSERT INTO users(name, password, email, is_admin)
    VALUES($1, $2, $3, $4)
    RETURNING *
    `,
      [name, password, email, isAdmin]
    );

    return data.rows[0];
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  try {
    const data = await client.query(
      `
      SELECT *
      FROM users;
   
    `
    );

    return data.rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getAllUsers,
};