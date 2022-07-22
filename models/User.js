//Database
const mongoose = require('mongoose');
// permet de n'avoir d'une donné d'utilisateur par collection
const uniqueValidator = require("mongoose-unique-validator")
const password = process.env.DB_PASSWORD
const username = process.env.DB_USER
const db = process.env.DB_NAME
const uri = `mongodb+srv://${username}:${password}@cluster1.mbtuz.mongodb.net/${db}?retryWrites=true&w=majority`

mongoose.connect(uri).then((()=> console.log("Connected to Mongo!"))).catch(err => console.error("Error connecting to Mongo:",err))
const userSchema = new mongoose.Schema({
// unique = permet de n'avoir qu'un seul mail par collection (peut créer des soucis à voir avec unique-validator)   
    email: {type: String, required: true, unique:true },
    password:{type: String, required: true},
})
// Permet de ne pas avoir plusieurs utilisateur avec la même addresse mail grâce à mongoose unique validator
userSchema.plugin(uniqueValidator)
const User = mongoose.model("User" ,userSchema)
// Export du module userChema grâce à la méthode .model de mongoose
module.exports = {mongoose, User}

