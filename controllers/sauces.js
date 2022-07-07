const Product = require("../models/Product")
const fs = require("fs/promises")
const {authenticateUser} = require("../middleware/auth")
//Fonction pour affiche toutes les sauces
function getSauces(_req, res) {
    console.log("le token a été validé, on est dans  get Sauces")
    // J'utilise la méthode "find" de mongoose pour trouver les sauces dans ma base de données
    Product.find({})
        //Response envoyée  
        .then(products => res.send(products))
        //Sinon je renvoie une erreur 500
        .catch(error => res.status(500)
            .send(error))
}

function getSauce(req, _res) {
    const {
        id
    } = req.params
    return Product.findById(id)
}
//Fonction qui affiche une sauce
function getSauceById(req, res) {
    getSauce(req, res)
        .then((product) => sendClientResponse(product, res))
        //Sinon je renvoie une erreur
        .catch((err) => res.status(500)
            .send(err))
}
//Fonction pour supprimer une sauce
function deleteSauce(req, res) {
    const {id} = req.params
            
    // 1. L'ordre de suppression de produit est envoyé à Mongoo 
    Product.findByIdAndDelete(id)
        // 2. Supprimer l'image localment
        .then((product) => {
            if (product.userId === req.body.userId) {
                deleteImage(product)
                return product
            }else {
                
                return res.status(403)
                    .json({
                        message: "Vous n'avez pas le droit de supprimer cette sauce"
                    })
                    }
                
        })
        // 3. Envoyer un message de succée au client  (site web) 
       // .then(() => res.status(200).json({message: "La Sauce a été supprimée !"}))
            
        .catch((err) => res.status(500)
            .send({
                message: err
            }))
}

function modifySauce(req, res) {
    //Récupere des données de la requete
    const id = req.params.id
    //console.log("body and params:", body, params)
    console.log("req.file", req.file)
    //J'ai mis une variable hasNewImage si oui ou non il y a nouvelle image qui a été updatée
    const hasNewImage = req.file != null
    const payload = makePayload(hasNewImage, req)
    
    Product.findByIdAndUpdate(id, payload)
        .then((dbRespance) => sendClientResponse(dbRespance, res))
        .then((product) => {
            if (product.userId === req.body.userId) {
                modifySauce(product)
                return product
            }else {
                
                return res.status(403)
                    .json({
                        message: "Vous n'avez pas le droit de modifié cette sauce"
                    })
                    }
                
        })
        
        .catch((err) => console.error("Problem Updating", err)) //si il y a un probleme de connexion a la base de données
}

function deleteImage(product) {
    if (product == null) {
        const imageToDelete = product.imageUrl.split("/images/")
            .at(-1)
        fs.unlink("images/" + imageToDelete)
    }
}

function makePayload(hasNewImage, req) {
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
    if (product == null) {
        console.log("Nothing To Update")
        return res.status(404)
            .send({
                message: "Object not found in database"
            })
    }
    console.log("ALL GOOD,UPDATING", product)
    return Promise.resolve(res.status(200)
            .send(product))
        .then(() => product)
}

function makeImageUrl(req, filename) {
    return req.protocol + '://' + req.get('host') + "/images/" + filename
}

function createSauce(req, res) {
    const {
        body
        , file
    } = req
    const {
        filename
    } = file
    const sauce = JSON.parse(body.sauce)
    const {
        name
        , manufacturer
        , description
        , mainPepper
        , heat
        , userId
    } = sauce
    
    const product = new Product({
        userId: userId
        , name: name
        , manufacturer: manufacturer
        , description: description
        , mainPepper: mainPepper
        , imageUrl: makeImageUrl(req, filename)
        , heat: heat
        , likes: 0
        , dislikes: 0
        , usersLiked: []
        , usersDisliked: []
    })
    product
        .save()
        .then((message) => {
            res.status(201)
                .send({
                    message: message
                })
            return console.log("produit enregistré")
        })
        .catch(console.error)
}

function likeSauce(req, res) {
    const {
        like
        , userId
    } = req.body
    if (![0, -1, 1].includes(like)) return res.status(400)
        .send({
            message: "Invalid like value"
        })
    
    getSauce(req, res)
        .then((product) => updateVote(product, like, userId, res))
        .then(pr => pr.save()) //save le produit dans les base de données
        .then(prod => sendClientResponse(prod, res))
        .catch((err) => res.status(500)
            .send(err))
}

function updateVote(product, like, userId, res) {
    if (like === 1 || like === -1)
        return incrementvote(product, userId, like)
    return resetVote(product, userId, res) //si ce que je devais annuler c'est un like ou un dislike
}

function incrementvote(product, userId, like) {
    const usersLiked = product.usersLiked
    const usersDisliked = product.usersDisliked
    
    const votersArray = like === 1 ? usersLiked : usersDisliked
    if (votersArray.includes(userId)) return product
    votersArray.push(userId)
    
    if (like === 1) {
        ++product.likes
    } else {
        ++product.dislikes
    }
    return product
}

function resetVote(product, userId, _res) {
    const {
        usersLiked
        , usersDisliked
    } = product
    //les array qui ont l userid
    if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId))) return Promise.reject("User seems to have voted both ways") //pour forcer le catch
    // les users ne sont pas dans les deux array
    //Aucun array qui gere les userid
    if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId))) return Promise.reject("User seems to not have  voted ")
    
    //supprimer un élément dans un array
    //pour trouver l array qui inclut les userid et verify le
    if (usersLiked.includes(userId)) {
        --product.likes
        product.usersLiked = product.usersLiked.filter(id => id !== userId) //renvoie un array ou chaque élement aura différent du userid
    } else {
        --product.dislikes
        product.usersDisliked = product.usersDisliked.filter(id => id !== userId)
    }
    return product
}
module.exports = {
    getSauces
    , createSauce
    , getSauceById
    , deleteSauce
    , modifySauce
    , likeSauce
    , authenticateUser
}
   
