const express = require("express")
const {createUser, logUser} = require("../controllers/users")
const authRouter = express.Router()

//Middleware de validation des email , pour faire la verification de l'email  pour se connecter

const emailValid = require('../middleware/emailValid')
const passValid = require ('../middleware/passwordValid') 


authRouter.post("/signup", passValid, emailValid, createUser)  
authRouter.post("/login", logUser)


module.exports = {authRouter}