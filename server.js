require ("dotenv").config ();

const jwt= require ("jsonwebtoken");

const express= require ("express");

const app= express ();

const bcrypt = require("bcrypt");

const cors = require("cors");
app.use(cors());

const morgan = require('morgan');
app.use(morgan('dev'));
function myFirstMiddleware(req, res, next) {
  console.log("We have received a request")
  console.log("Now we will respond")
  next(); 
}
app.use(myFirstMiddleware)

app.use(express.json());


const { fetchAllTrips, 
    fetchTripById, 
    createNewTrip, 
    createNewUser, 
    fetchUserByUsername, 
    createInitialUsers, 
    createComments,
    fetchComments,
    fetchCommentByUserId,
    deleteCommentById,
    deleteReviewById,
    createNewReview,
    updateReviewById,
    createInitialReviews,
fetchReviewById,
fetchReviews,fetchUserByUserId, fetchAllUsers,fetchReviewByTripId} =  require("./db/seedData");

// Trip Section
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
        console.log('hello');
        const myAuthToken= req.headers.authorization.slice (7);
        console.log("my actual token", myAuthToken)
     console.log(req.body, 'req.body')
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
app.post("/api/trips1", postNewTrip)

// User Section

async function registerNewUser(req, res){
    try{
        const newUserData= req.body
        console.log(req.body)
        console.log(process.env.JWT_SECRET)
        const saltvalue= await bcrypt.genSalt(12)
        const hashpassword= await bcrypt.hash(req.body.password, saltvalue)
        const newJWTToken= await jwt.sign(req.body, `${process.env.JWT_SECRET}`, {
            expiresIn: "1w"
        })
         if(req.body.is_Admin !== false && req.body.is_Admin !== true){
            req.body.is_Admin = false

         }
        if (newJWTToken){
            const userObj= {
                username: req.body.username,
                password: hashpassword,
                email: req.body.email,
                is_Admin: req.body.is_Admin
            }
            const newUserForDb= await createNewUser (userObj);
            
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

app.post("/api/users/login", async (req,res)=>{
    try{
        const {username, password}= req.body;

        if(!username.length || !password.length){
            res.send({
                error: true,
                message: "You failed to provide either a username or password text.",
                data: null
            })
        } else{
            const userFromDb= await fetchUserByUsername (username)

            if(userFromDb && bcrypt.compare(password, userFromDb.password)){
                const token= await jwt.sign ({
                    username: userFromDb.username,
                    admin: userFromDb.is_Admin
                }, process.env.JWT_SECRET, {
                    expiresIn: "1w"
                })

                if (token){
                    res.send({
                        error: false,
                        data: token,
                        message: "Thanks for logging in!"
                    }).status (200)
                } else{
                    res.send({
                        error: true,
                        data: null,
                        message: "Failed to log in!"
                    }).status (401)
                }
            } else{
                res.send({
                    error: true,
                    data: null,
                    message: "No user exists by that username."
                }).status (401)
            }
        }
    } catch (error){
        console.error(error);
    }
}) 

async function getAllUsers(req, res, next){
    try{
      

      const mySpecificUser = await fetchAllUsers();

      res.send(mySpecificUser)
    }catch(error){
        console.error(error)
    }
}
app.get("/api/users", getAllUsers)


// Comment section

async function getAllComments(req, res, next){
    try{
    const actualCommentData = await fetchComments();
    if(actualCommentData.length){
        res.send(actualCommentData)
        console.log("1")
    }else{
        res.send("no comments rendered..")
        console.log("2")
    }
    }catch(error){
        console.error(error)
        console.log("3")
    }
  }
  app.get("/api/comments", getAllComments)

  async function getCommentById(req, res, next){
    try{
      console.log(req.params.user_Id)

      const mySpecificComment = await fetchCommentByUserId(Number(req.params.user_Id))

      res.send(mySpecificComment)
    }catch(error){
        console.error(error)
    }
}
app.get("/api/comments/:user_Id", getCommentById)


async function postNewComment (req, res, next){
    try{
        const myAuthToken= req.headers.authorization.slice(7)
        const auth= jwt.verify(myAuthToken, process.env.JWT_SECRET)
        if(auth){
            const userFromDb= await fetchUserByUsername (auth.username)
            if(userFromDb){
                const response= await createComments(req.body)
                console.log(response)
                res.send(response)
            } else{
                res.send({error: true, message: "You need to have an account before being able to comment."})
            }
        }   else{
            res.send({error: true, message: "Failed to create comment. Try again."})
        }
    } catch(error){
        console.log(error)
    }
}
app.post("/api/comments", postNewComment)

async function deleteComment (req, res){
    try{
        const myAuthToken= req.headers.authorization.slice(7)
        const auth= jwt.verify(myAuthToken, process.env.JWT_SECRET)
        if(auth){
            const userFromDb= await fetchUserByUsername (auth.username)
            if(userFromDb){
                const response= await deleteCommentById(Number(req.params.id))
                res.send({response, message: "Comment deleted"})
            } else{
                res.send ({error: true, message: "Failed to delete comment."})
            }
        } else{
            res.send ({error: true, message: "Failed to decrypt token."})
        }
    } catch (error){
        console.log(error)
    }
}
app.delete("/api/comments/:reviewId", deleteComment)

// Reviews Section

async function postNewReview (req, res, next){
    try{
        const myAuthToken= req.headers.authorization.slice(7)
        const auth= jwt.verify(myAuthToken, process.env.JWT_SECRET)
        if(auth){
            const userFromDb= await fetchUserByUsername (auth.username)
            if(userFromDb){
                const response= await createNewReview(req.body)
                console.log(response)
                res.send(response)
            } else{
                res.send({error: true, message: "You need to have an account before being able to create a review."})
            }
        }   else{
            res.send({error: true, message: "Failed to create review. Try again."})
        }
    } catch(error){
        console.log(error)
    }
}
app.post("/api/reviews", postNewReview)

async function getAllReviews(req, res, next){
    try{
    const actualReviewData = await fetchReviews();
    console.log(actualReviewData)
    if(actualReviewData.length){
        res.send(actualReviewData)
    }else{
        res.send('no reviews rendered')
    }
    }catch(error){
        console.error(error)
    }
  }
  app.get("/api/reviews", getAllReviews)

//   async function getReviewById(req, res, next){
//     try{
//       console.log(req.params.id)

//       const mySpecificReview = await fetchReviewByTripId(Number(req.params.id))

//       res.send(mySpecificReview)
//     }catch(error){
//         console.error(error)
//     }
// }
// app.get("/api/reviews/:id", getReviewById)

async function getReviewByTripId(req, res, next){
    try{
      console.log(req.params.tripId)

      const mySpecificReview = await fetchReviewByTripId(Number(req.params.tripId))

      res.send(mySpecificReview)
    }catch(error){
        console.error(error)
    }
}
app.get("/api/reviews/:tripId", getReviewByTripId)

async function deleteASingleReview(req,res){
    try{
     console.log(req.params.id)
     const theDeletedData = await deleteReviewById(Number(req.params.id))

     res.send(theDeletedData)
    }catch(error){
        console.error(error)
    }
}
app.delete("/api/reviews/:id", deleteASingleReview)

const client= require ("./db/index")
  client.connect();

app.listen (3000, () => {
  console.log ("We are now connected to port 3000.")
})