//Module pour charger mes variables
require('dotenv').config()
//Importation du package Express
const express = require("express")
const app = express()
const cors = require("cors")
//Module de sécurité contre les attaques XSS 
const xss = require("xss-clean")

//Middleware 
app.use(cors())
//A la place de bodyparser, on utilise le module Express body parser 
app.use(express.json())
app.use(xss())


module.exports = {app, express, }