const express= require ("express");

const app= express ();

function myFirstMiddleware(req, res, next) {
  console.log("We have received a request")
  console.log("Now we will respond")
  next(); 
}
app.use(myFirstMiddleware)

app.use(express.json());

// async function checkIfTokenExists(req, res, next) {
//       try {
//           console.log(req.headers)
  
//           if (req.headers.Authorization.length) {
//               console.log("User is valid");
//           } else {
//               console.log("Error. User is not valid.");
//           }
//       } catch (error) {
//           console.log(error); 
//       }
//   }
//   app.use(checkIfTokenExists)

const { fetchAllTrips, fetchTripById, createNewTrip } =  require("./db/seed");

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
app.get("/api/trips", getAllTrips)

async function deleteASingleTrip(req,res){
    try{
     console.log(req.params.id)
     const theDeletedData = await deleteTripById(Number(req.params.id))

     res.send(theDeletedData)
    }catch(error){
        console.error(error)
    }
}
app.delete("/api/trips/:id", deleteASingleTrip)

async function updateATrip(req,res){
    try{
      let theTripId = Number(req.params.id);
      let theActualUpdatedData = req.body

      const newUpdatedTrip = await updateTripById(theTripId, theActualUpdatedData)

      res.send(newUpdatedTrip)
    }catch(error){
        console.error(error)
    }
}
app.put("/api/trips/:id" , updateATrip)

async function getTripById(req, res, next){
    try{
      console.log(req.params.id)

      const mySpecificTrip = await fetchTripById(Number(req.params.id))

      res.send(mySpecificTrip)
    }catch(error){
        console.error(error)
    }
}
app.get("/api/trips/:id", getTripById)

async function postNewTrip(req, res, next){
    try{
     console.log(req.body)
     const newTripToTake = await createNewTrip(req.body)

     res.send(newTripToTake)
    }catch(error){
        console.error(error)
    }
}

app.post("/api/trips", postNewTrip)

const client= require ("./db/index")
client.connect ();

app.listen (3000, () => {
  console.log ("We are now connected to port 3000.")
})