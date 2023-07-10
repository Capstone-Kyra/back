const client = require("./index");

async function createReview(description, rating, userId, tripId ) {
  try {
    
    const data = await client.query(
      `
    INSERT INTO reviews(description, rating, "userId", "tripId")
    VALUES($1, $2, $3, $4)
    RETURNING *
    `,
      [description, rating, userId, tripId]
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
      WHERE 'tripId' = $1
      RETURNING *;
      `, [tripId])

      if(rows.length){
          return rows[0]
      }else{
          return 'failed to delete review'
      }
  }catch(error){
      console.error(error)
  }
}

module.exports = {
  createReview,
  deleteReviewsById
};