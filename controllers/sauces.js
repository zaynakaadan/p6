const Product = require("../models/Product")
const {unLink} = require("fs")
//Fonction pour affiche toutes les sauces
function getSauces(req,res){
    console.log("le token a été validé, on est dans  get Sauces")
    // J'utilise la méthode "find" de mongoose pour trouver les sauces dans ma base de données
    Product.find({})
        //Response envoyée  
        .then(products => res.send( products))
        //Sinon je renvoie une erreur 500
        .catch(error => res.status(500).send(error))
    }
//Fonction qui affiche une sauce
function getSauceById(req,res) {
    const {id}= req.params
   //J'utilise la méthode findById de mongoose pour trouver seulement une sauce dans ma base de données 
    Product.findById(id)
    //Response envoyée
        .then(product => {
            res.send(product)
})//Sinon je renvoie une erreur
        .catch(console.error)
}
//Fonction pour supprimer une sauce
function deleteSauce(req,res){
    const {id}= req.params
 // 1. L'ordre de suppression de produit est envoyé à Mongoo 
    Product.findByIdAndDelete(id)
 // 2. Supprimer l'image localment
    .then(deleteImage)
 // 3. Envoyer un message de succée au client  (site web) 
    .then((product) => res.send({ message: product }))
    .catch((err) => res.status(500).send({message: err}))
}
function deleteImage(product){// nom du fichier
    const imageUrl = product.imageUrl
      console.log("on va supprimer le fichier avec le nom suivent", imageUrl)
    //L'URL de l'image est coupée pour n'avoir que le nom du fichier
    const fileToDelete = imageUrl.split("/").at(-1)
   return unLink(`images/${fileToDelete}`).then(() => product )
      }
  
  

function createSauce(req,res){
    //console.log()
    const { body,file } = req
    //console.log({file})
    const {filename} = file
    const sauce = JSON.parse(body.sauce)
    const {name, manufacturer, description, mainPepper, heat, userId} = sauce

    function makeImageUrl(req, filename ) {
        return req.protocol + '://' + req.get('host') + "/images/" +  filename
    } 
    
    const product = new Product({
        userId: userId,
        name: name,
        manufacturer: manufacturer,
        description: description,
        mainPepper: mainPepper,
        imageUrl: makeImageUrl(req, filename),
        heat: heat,
        likes : 0,
        dislikes : 0,
        usersLiked : [],
        usersDisliked : []
        })
        product
        .save()
        .then((message) => {
            res.status(201).send({message: message})
            return console.log("produit enregistré", res)
        }).catch(console.error)
    }

module.exports = {getSauces, createSauce, getSauceById, deleteSauce}