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
                description TEXT
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
              "reviewerId" INTEGER REFERENCES users("userId"),
              "idOfTrip" INTEGER REFERENCES trips1("tripId")
      
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

async function createNewTrip (newTripObj){
    try{
        const {rows}= await client.query (`
            INSERT INTO trips1 (location, type, description)
            VALUES ($1, $2, $3)
            RETURNING *;
        `, [newTripObj.location, newTripObj.type, newTripObj.description]);

            return rows [0];
    } catch (error){
        console.log(error);
    }
}

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

async function createInitialReviews() {
    try {
      console.log("Starting to create Reviews");
  
      const review1 = await createReview("this is great!!!", 10, 1, 3);
      const review2 = await createReview("this is terrible!!!", 10, 1, 2);
  
      console.log(review1);
      console.log(review2);
  
      console.log("Finished creating Reviews");
    } catch (error) {
      throw error;
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
     WHERE 'tripId' = $4
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
        WHERE 'tripId' = $1
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

async function createComments (comments){
    try{
        const {rows}= await client.query(
            `INSERT INTO comments(text, username, "user_id", "trips_id"
            VALUES($1, $2, $3, $4)
            RETURNING *`,
            [comments.text, comments.username, comments.user_id, comments.trips_id]
        );
        return rows[0]
    }catch(error){
    console.log(error);
    }
}

async function fetchComments (){
    try{
        const {rows} = await client.query(`SELECT * FROM comments`)
        return rows;
    } catch(error){
        console.log(error);
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
            description: "traveling to IBM world headquarters building to get a consultation on a technology service needed"
        });
        // console.log (firstNewTrip)

        const secondNewTrip= await createNewTrip ({
            location: "Florida",
            type: "family",
            description: "traveling to DisneyWorld with family to experience the magic of Disney"
        });
        // console.log (secondNewTrip)

        const thirdNewTrip= await createNewTrip ({
            location: "Alaska",
            type: "tour",
            description: "taking a 7 day active adventure tour near Anchorage"
        });
        // console.log(thirdNewTrip)

        const allTrips= await fetchAllTrips();
        console.log ('all trips:' , allTrips)

        const findSpecificTrip = await fetchTripById(1);
        console.log(findSpecificTrip)
        console.log("hi")
        await createInitialUsers();
        console.log("hiiii")
        await createInitialReviews();
        client.end ();
    } catch (error){
        console.log(error);
    }
}

 buildDatabase ();

module.exports={
    fetchAllTrips,
    fetchTripById,
    updateTripById,
    deleteTripById,
    createNewTrip,
    createInitialReviews,
    createInitialUsers,
    createNewUser,
    fetchUserByUsername,
    createComments,
    fetchComments
}