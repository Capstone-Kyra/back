const client= require ("./index");
const { createReview } = require("./reviews");
const { createUser, getAllUsers } = require("./users");

async function createTables (){
    try{
        console.log('creating tables')
        await client.query(`
            CREATE TABLE trips1(
                "tripId" SERIAL PRIMARY KEY,
                location VARCHAR (255) NOT NULL,
                type VARCHAR (255) NOT NULL,
                description TEXT,
                picture TEXT
            );`);

            await client.query(`
            CREATE TABLE users (
            "userId" SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            "is_Admin" BOOLEAN DEFAULT false
            );`);

            await client.query(`
            CREATE TABLE reviews (
              "reviewId" SERIAL PRIMARY KEY,
              description VARCHAR(255) NOT NULL,
              rating INTEGER NOT NULL,
              location VARCHAR(255) NOT NULL,
              "userId" INTEGER REFERENCES users("userId"),
              "tripId" INTEGER REFERENCES trips1("tripId")
      
      );`);
            await client.query (`
            CREATE TABLE comments (
                "commentId" SERIAL PRIMARY KEY,
                text VARCHAR (255) NOT NULL,
                username VARCHAR (255) NOT NULL,
                "userId" INTEGER REFERENCES users("userId"),
                "reviewId" INTEGER REFERENCES reviews("reviewId")
            );`);
    } catch (error){
        console.log(error);
    }
}

async function destroyTables (){
    try{
        await client.query (`
            
            DROP TABLE IF EXISTS comments;
            DROP TABLE IF EXISTS reviews;
            DROP TABLE IF EXISTS users;
            DROP TABLE IF EXISTS trips1;
        `)
    } catch (error){
        console.log(error);
    }
}
// Trip Section
async function createNewTrip (newTripObj){
    try{
        const {rows}= await client.query (`
            INSERT INTO trips1 (location, type, description, picture)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `, [newTripObj.location, newTripObj.type, newTripObj.description, newTripObj.picture]);

            return rows [0];
    } catch (error){
        console.log(error);
    }
}

async function fetchTripById(idValue) {
    try {
        const { rows } = await client.query(`
            SELECT * FROM trips1
            WHERE "tripId" = ${idValue};
        `)

        return rows[0];
    } catch (error) {
        console.log(error); 
    }
}

async function fetchAllTrips (){
    try{
        const {rows}= await client.query (`
            SELECT * FROM trips1;
        `);
        return rows;
    }catch (error){
        console.log(error);
    }
}

async function updateTripById(tripId, {location, type, description}){
    try{
     const { rows } = await client.query(`
     UPDATE trips
     SET location = $1, type = $2, description = $3
     WHERE "tripId" = $4
     RETURNING *;
     ` [location, type, description, tripId])

     if(rows.length){
        return rows[0];
     }
    }catch(error){
        console.error(error)
    }
}

async function deleteTripById(tripId){
    try{
        const { rows } = await client.query(`
        DELETE FROM trips
        WHERE "tripId" = $1
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

// Users Section
async function createInitialUsers() {
    try {
      console.log("Starting to create Users");
  
      await createNewUser({username:"1", password:"12345678", email: "testUser1@gmail.com", is_Admin: false});
      await createNewUser({username: "testUser2", password: "12345678", email: "testUser2@gmail.com", is_Admin: false});
      await createNewUser({username: "testAdmin1", password: "12345678", email: "testAdmin1@gmail.com", is_Admin: true});
  
      const allUsers = await getAllUsers();
      console.log("allUsers: ", allUsers);
      console.log("Finished creating Users");
    } catch (error) {
      throw error;
    }
  }
  async function createNewUser({username, password, email,is_Admin}) {
    try {
        
        const { rows } = await client.query(`
            INSERT INTO users(username, password, email, "is_Admin")
            VALUES ($1, $2, $3, $4)
            RETURNING username, email, "is_Admin"; 
        `, [username, password, email, is_Admin])
        
        if (rows.length) {
            return rows[0];
        }
    } catch (error) {
        console.log(error); 
    }
};

async function fetchUserByUsername(username) {
    try {
        const { rows } = await client.query(`
            SELECT * FROM users
            WHERE username = $1;
        `, [username])

        if (rows.length) {
            return rows[0]; 
        }
    } catch (error) {
        console.log(error); 
    }
}

async function fetchUserByUserId (idValue){
    try{
        let userId= Number(idValue)
        const {rows} = await client.query(`
        SELECT * FROM users
        
        WHERE "userId"= $1;
        `,
        [userId]
        );
        console.log(rows);
    } catch(error){
        console.log(error);
    }
}

async function fetchAllUsers (){
    try{
        const {rows}= await client.query (`
            SELECT * FROM users;
        `);
        return rows;
    }catch (error){
        console.log(error);
    }
}


// Comment Section
// async function createComments (comments){
//     try{
//         const {rows}= await client.query(
//             `INSERT INTO comments(text, username, "user_Id", "review_Id")
//             VALUES($1, $2, $3, $4)
//             RETURNING *`,
//             [comments.text, comments.username, comments.userId, comments.reviewId]
//         );
//         return rows[0]
//     }catch(error){
//     console.log(error);
//     }
// }

async function createComments(text, username, userId, reviewId ) {
    try {
      
      const data = await client.query(
        `
      INSERT INTO comments(text, username, "userId", "reviewId")
      VALUES($1, $2, $3, $4)
      RETURNING *;
      `,
        [text, username, userId, reviewId]
      );
  
      return data.rows[0];
    } catch (error) {
      throw error;
    }
  }

async function fetchComments (){
    try{
        
        const {rows} = await client.query(`SELECT * FROM comments;`)
        console.log("2")
        return rows;
    } catch(error){
        console.log(error);
    }
}
async function fetchCommentByUserId (idValue){
    try{
        let userId= Number(idValue)
        const {rows} = await client.query(`
        SELECT * FROM comments
        INNER JOIN users ON comments."user_Id"=users."userId"
        WHERE 'user_Id'= $1;
        `,
        [userId]
        );
        console.low(rows);
    } catch(error){
        console.log(error);
    }
}

async function deleteCommentById(commentId){
    try{
        const { rows } = await client.query(`
        DELETE FROM comments
        WHERE 'commentId' = $1
        RETURNING *;
        `, [commentId])

        if(rows.length){
            return rows[0]
        }else{
            return 'failed to delete comment'
        }
    }catch(error){
        console.error(error)
    }
}

async function updateCommentsById(reviewId, { rating, description}){
    try{
     const { rows } = await client.query(`
     UPDATE reviews
     SET rating = $1, description = $2
     WHERE 'reviewId' = $3
     RETURNING *;
     ` [rating, description, reviewId])

     if(rows.length){
        return rows[0];
     }
    }catch(error){
        console.error(error)
    }
}

// Reviews Section



  async function createNewReview ([rating,description,location,reviewId]){
    try{
        const {rows}= await client.query (`
            INSERT INTO reviews (rating,description,location,reviewId)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `, [rating,description,location,reviewId]);

            return rows [0];
    } catch (error){
        console.log(error);
    }
}

async function fetchReviews (){
    try{
        
        const {rows} = await client.query(`SELECT * FROM reviews;`)
        console.log("2")
        return rows;
    } catch(error){
        console.log(error);
    }
}

async function fetchReviewByTripId (idValue){
    console.log('this is fetch by trip id"')
    try{
        let tripId= Number(idValue)
        const {rows} = await client.query(`
        SELECT trips1."tripId", trips1.location, trips1.picture, reviews.description, comments.text, trips1.type, trips1.description, reviews.rating, reviews."userId", users.username, users.email, comments."commentId" FROM trips1
        JOIN reviews
        ON reviews."tripId"=trips1."tripId"
        JOIN users
        ON reviews."userId"=users."userId"
        JOIN comments
        ON reviews."userId"=comments."commentId";
        ` );
        return rows;
        console.log(rows);
    } catch(error){
        console.log(error);
    }
}

async function fetchReviewByUserId (idValue){
    try{
        let userId= Number(idValue)
        const {rows} = await client.query(`
        SELECT * FROM reviews
        WHERE "userId"= $1;
        `,
        [userId]
        );
        console.log(rows);
        return rows;
    } catch(error){
        console.log(error);
    }
}


async function createInitialReviews() {
    try {
      console.log("Starting to create Reviews"); 
  
      const review1 = await createReview("this is great!!!", 10, 1,3,'new york');
      const review2 = await createReview("this is terrible!!!", 10, 1,  2, 'florida');
  
      console.log(review1);
    //   console.log(review2);
  
      console.log("Finished creating Reviews");
    } catch (error) {
      throw error;
    }
  }

async function fetchReviewById(idValue) {
    try {
        const { rows } = await client.query(`
            SELECT * FROM reviews
            WHERE "reviewId" = ${idValue};
        `)

        return rows[0];
    } catch (error) {
        console.log(error); 
    }
}

  async function deleteReviewById(reviewId){
    try{
        const { rows } = await client.query(`
        DELETE FROM reviews
        WHERE 'reviewId' = $1
        RETURNING *;
        `, [reviewId])

        if(rows.length){
            return rows[0]
        }else{
            return 'failed to delete review'
        }
    }catch(error){
        console.error(error)
    }
}

async function updateReviewById(reviewId, { rating, description}){
    try{
     const { rows } = await client.query(`
     UPDATE reviews
     SET rating = $1, description = $2
     WHERE 'reviewId' = $3
     RETURNING *;
     ` [rating, description, reviewId])

     if(rows.length){
        return rows[0];
     }
    }catch(error){
        console.error(error)
    }
}

  async function createInitialComments() {
    try {
      console.log("Starting to create Comments");
  
      const testCommentOne= await createComments("this is great!!!", "cristina", 1, 1);

      const testCommentTwo= await createComments("this is terrible!!!", "anthony", 2, 2);
  
      console.log(testCommentOne);
    //   console.log(testCommentTwo);
  
      console.log("Finished creating Comments");
    } catch (error) {
      throw error;
    }
  }

async function buildDatabase (){
    try {
         client.connect ();

        await destroyTables();
        await createTables ();

        const firstNewTrip= await createNewTrip ({
            location: "New York",
            type: "business",
            description: "traveling to IBM world headquarters building to get a consultation on a technology service needed",
            picture: "https://i.natgeofe.com/k/5b396b5e-59e7-43a6-9448-708125549aa1/new-york-statue-of-liberty_16x9.jpg?w=1200"
        });

        const secondNewTrip= await createNewTrip ({
            location: "Florida",
            type: "family",
            description: "traveling to DisneyWorld with family to experience the magic of Disney",
            picture: "https://hips.hearstapps.com/hmg-prod/images/disney-world-2-1512760548.jpg"
        });

        const thirdNewTrip= await createNewTrip ({
            location: "Alaska",
            type: "tour",
            description: "taking a 7 day active adventure tour near Anchorage",
            picture: "https://deih43ym53wif.cloudfront.net/view-along-dalton-highway-toward-brooks-alaska-shutterstock_627939359.jpg_f3d4351402.jpg"
        });

       

        const allTrips= await fetchAllTrips();
        console.log ('all trips:' , allTrips)

        const findSpecificTrip = await fetchTripById(1);
        console.log(findSpecificTrip)
        await createInitialUsers();
        await createInitialReviews();
        await createInitialComments();
        // client.end ();
    } catch (error){
        console.log(error);
    }
}

//    buildDatabase ();

module.exports={
    fetchAllTrips,
    fetchTripById,
    updateTripById,
    deleteTripById,
    createNewTrip,
    createInitialReviews,
    createInitialUsers,
    createInitialComments,
    createNewUser,
    fetchUserByUsername,
    createComments,
    fetchComments,
    fetchCommentByUserId,
    deleteCommentById,
    deleteReviewById,
    createNewReview,
    updateReviewById,
    fetchReviewById,
    fetchReviewByUserId,
    fetchReviews,
    fetchUserByUserId,
    fetchAllUsers,
    fetchReviewByTripId,
    buildDatabase
}