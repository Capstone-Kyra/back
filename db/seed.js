const client= require ("./index");

async function createTables (){
    try{
        await client.query(`
            CREATE TABLE trips(
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
            DROP TABLE IF EXITS trips;
        `)
    } catch (error){
        console.log(error);
    }
}

async function buildDatabase (){
    try {
        client.connect ();

        await destroyTables();
        await createTables ();

        client.end ();
    } catch (error){
        console.log(error);
    }
}

buildDatabase ();