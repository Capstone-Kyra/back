const client= require ("./index");

async function createTables (){
    try{
        await client.query(`
            CREATE TABLE trips1(
                "tripId" SERIAL PRIMARY KEY,
                location VARCHAR (255) NOT NULL,
                type VARCHAR (255) NOT NULL,
                description TEXT
            );
        `)
    } catch (error){
        console.log(error);
    }
}

async function destroyTables (){
    try{
        await client.query (`
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

async function updateTripById(tripID, {location, type, description}){
    try{
     const { rows } = await client.query(`
     UPDATE trips
     SET location = $1, type = $2, description = $3
     WHERE 'tripID' = $4
     RETURNING *;
     ` [location, type, description])

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
        console.log (allTrips)

        const findSpecificTrip = await fetchTripById(1);
        console.log(findSpecificTrip)

        client.end ();
    } catch (error){
        console.log(error);
    }
}

// buildDatabase ();

module.exports={
    fetchAllTrips,
    fetchTripById,
    createNewTrip
}