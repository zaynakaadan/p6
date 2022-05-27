
console.log("Voila du code JavaScript !")
require('dotenv').config()
const express = require("express")
const app = express()
const cors = require("cors")
const port = 3000

// Connection to database
require("./mongo")

// Controllers
const {createUser, logUser} = require("./controllers/users")
const {getSauces, createSauce} = require("./controllers/sauces")


//Middleware 
app.use(cors())
app.use(express.json())
const {authenticateUser} = require("./middleware/auth")
//Routes
app.post("/api/auth/signup", createUser)  
app.post("/api/auth/login", logUser)
app.get("/api/sauces", authenticateUser, getSauces)
app.post("/api/sauces",authenticateUser, createSauce)
app.get("/", (req, res) =>
    res.send("Hello World! new test"))

// Listen    
app.listen(port, () => console.log("listening on port"+ port))




