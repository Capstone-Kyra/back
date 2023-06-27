const express= require ("express");

const app= express ();

function myFirstMiddleware(req, res, next) {
  console.log("We have received a request")
  console.log("Now we will respond")
  next(); 
}
app.use(myFirstMiddleware)

app.use(express.json());

async function checkIfTokenExists(req, res, next) {
      try {
          console.log(req.headers)
  
          if (req.headers.Authorization.length) {
              console.log("User is valid");
          } else {
              console.log("Error. User is not valid.");
          }
      } catch (error) {
          console.log(error); 
      }
  }
  app.use(checkIfTokenExists)

const {fetchTripById, fetchAllTrips, createNewTrip} =  require("./db/seed");

async function getAllTrips(req, res, next){
  try{
  const actualTripData = await fetchAllTrips();
  if(actualTripData.length){
      res.send(actualTripData)
  }else{
      res.send("no trips rendered..")
  }
  }catch(error){
      console.error(error)
  }
}
app.get("/trips1", getAllTrips)

const client= require ("./db/index")
client.connect ();

app.listen (3000, () => {
  console.log ("We are now connected to port 3000.")
})