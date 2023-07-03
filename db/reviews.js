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

async function deleteReviewsById(tripId){
  try{
      const { rows } = await client.query(`
      DELETE FROM reviews
      WHERE 'tripID' = $1
      RETURNING *;
      `, [tripId])

      if(rows.length){
          return rows[0]
      }else{
          return 'failed to delete trip'
      }
  }catch(error){
      console.error(error)
  }
}

module.exports = {
  createReview,
  deleteReviewsById
};