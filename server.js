require ("dotenv").config ();

const jwt= require ("jsonwebtoken");

const express= require ("express");

const app= express ();

const cors = require("cors");
app.use(cors());


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

const { fetchAllTrips, fetchTripById, createNewTrip, createNewUser, fetchUserByUsername, createInitialUsers } =  require("./db/seed");

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

async function postNewTrip (req, res){
    try{
        const myAuthToken= req.headers.authorization.slice (7);
        console.log("my actual token", myAuthToken)

        const isThisTokenLegit= jwt.verify (myAuthToken, process.env.JWT_SECRET)
        console.log ("This is my decrypted token:")
        console.log(isThisTokenLegit)

        if (isThisTokenLegit){
            const userFromDb= await fetchUserByUsername (isThisTokenLegit.username)

            if (userFromDb){
                const newTripImTaking= await createNewTrip(req.body)
                res.send(newTripImTaking)
            }else{
                res.send({error: true, message: "User does not exist in database. Please register for a new account or try again."})
            }
        } else{
            res.send({error: true, message: "Failed to decrypt token"})
        }
    } catch (error){
        console.log (error)
    }
}
app.post("/trips1", postNewTrip)

async function registerNewUser(req, res){
    try{
        const newUserData= req.body
        const mySecret= process.env.JWT_SECRET;
        console.log(req.body)

        const newJWTToken= await jwt.sign(req.body, process.env.JWT_SECRET, {
            expiresIn: "1w"
        })

        if (newJWTToken){
            const newUserForDb= await createNewUser (req.body);

            if (newUserForDb){
                res.send({userData: newUserForDb, token: newJWTToken}).status (200)
            } else {
                res.send({error: true, message: "Failed to create user"}).status (403)
            }
        } else{
            res.send({error: true, message: "Failed to create valid auth token"})
        }
    } catch (error){
        console.log (error);
    }
}

app.post("/api/users/register", registerNewUser)

async function deleteASingleReview(req,res){
    try{
     console.log(req.params.id)
     const theDeletedData = await deleteReviewById(Number(req.params.id))

     res.send(theDeletedData)
    }catch(error){
        console.error(error)
    }
}
app.delete("/api/reviews/:id", deleteASingleTrip)

const client= require ("./db/index")
client.connect ();

app.listen (3000, () => {
  console.log ("We are now connected to port 3000.")
})