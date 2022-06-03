const Product = require("../models/Product")
const fs = require("fs/promises")
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
    .then((product) => deleteImage(product))
    .then((res) => console.log("FILE DELETED",res))
 // 3. Envoyer un message de succée au client  (site web) 
    .then((product) => sendClientResponse(product, res))
    .catch((err) => res.status(500).send({message: err}))
}

  
  function modifySauce(req,res){
      //Récupere des données de la requete
    const {params} = req //cas pas de image modifié
    const id = req.params.id
    
    //console.log("body and params:", body, params)
    console.log("req.file", req.file)

    //J'ai mis une variable hasNewImage si oui ou non il y a nouvelle image qui a été updatée
    const hasNewImage = req.file != null
    const payload = makePayload(hasNewImage, req)
    

    Product.findByIdAndUpdate(id, payload)
    .then((dbRespance) =>  sendClientResponse(dbRespance, res))
        .then ((product) => deleteImage(product))
        .then((res) => console.log("FILE DELETED",res))
    .catch((err) => console.error("Problem Updating",err))//si il y a un probleme de connexion a la base de données
}
function deleteImage(product){
    if (product == null) return
    console.log("Delete image", product)
    const imageToDelete = product.imageUrl.split("/").at(-1)
  return  fs.unlink("images/" + imageToDelete)
  
}

function makePayload(hasNewImage, req){
    //S'il n'y a pas de nouvelle image
    console.log("hasNewImage:", hasNewImage)
    if (!hasNewImage) return req.body
    const payload = JSON.parse(req.body.sauce)
    payload.imageUrl = makeImageUrl(req, req.file.filename)
    console.log("NOUVELLE IMAGE A GERER il y a un image");
    console.log("Voici le payload:", payload)

    return payload
}
function sendClientResponse(product, res) { //un fonction qui va renvoyer la reponse au client
    if (product == null){
        console.log("Nothing To Update")
      return  res.status(404).send({message: "Object not found in database"})
    } 
    console.log("ALL GOOD,UPDATING", product)
   return Promise.resolve(res.status(200).send({message: "Successfully updated"})).then(() => product)

    
}

function makeImageUrl(req, filename ) {
    return req.protocol + '://' + req.get('host') + "/images/" +  filename
} 

function createSauce(req,res){
    //console.log()
    const { body,file } = req
    //console.log({file})
    const {filename} = file
    const sauce = JSON.parse(body.sauce)
    const {name, manufacturer, description, mainPepper, heat, userId} = sauce

   
    
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

module.exports = {getSauces, createSauce, getSauceById, deleteSauce, modifySauce}