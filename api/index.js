const express = require('express')
const app = express();


app.use(express.json());

const {fetchTripById, fetchAllTrips, createNewTrip} =  require("./db/seed");

async function getAllTrips(req, res, next){
    try{
       
    const actualTripData = await fetchAllTrips();
    if(actualTripData.length){
        res.send(actualTripData)
    }else{
        res.send('no trips rendered..')
    }
    }catch(error){
        console.error(error)
    }
}
app.get('/api/trips', getAllTrips)

