const express = require("express")
const {createUser, logUser} = require("../controllers/users")
const authRouter = express.Router()

authRouter.post("/signup", createUser)  
authRouter.post("/login", logUser)


module.exports = {authRouter}