
const  mongoose  = require("mongoose")

const productSchema = new mongoose.Schema({
    userId: String,
    name : String,
    manufacturer : String,
    description : String,
    mainPepper : String,
    imageUrl : String,
    heat : Number,
    likes : Number,
    dislikes : Number,
    usersLiked : [String],
    usersDisliked : [String]
})
//fabriquer un modèle
const product = mongoose.model("product", productSchema)



function getSauces(req,res){
    console.log("le token a été validé, on est dans  get Sauces")
   
    //console.log("le Token est ok", decoded)
    product.find({}).then(products => res.send(products))
    //res.send({message:[{sauce:"sauce1", image:"file1"},{sauce:"sauce2", image:"file2"}]})//Array des sauces,j'ai envoyé un objet
}

function createSauce(req,res){
    
    const product = new product({
        userId: "p",
        name : "p",
        manufacturer : "p",
        description : "p",
        mainPepper : "p",
        imageUrl : "p",
        heat : 2,
        likes : 2,
        dislikes : 2,
        usersLiked : ["p"],
        usersDisliked : ["p"]
        
    })
    product.save().then((res)=> console.log("produit enregistré", res)).catch(console.error)
    }


module.exports = {getSauces, createSauce}