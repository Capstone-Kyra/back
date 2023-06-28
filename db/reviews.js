const client = require("./index");

async function createReview(content, score, user_id, trips_id) {
  try {
    
    const data = await client.query(
      `
    INSERT INTO reviews(content, score, user_id, trips_id)
    VALUES($1, $2, $3, $4)
    RETURNING *
    `,
      [content, score, user_id, trips_id]
    );

    return data.rows[0];
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createReview,
};