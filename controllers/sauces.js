const Product = require("../models/Product")
const fs = require("fs/promises")
const {authenticateUser} = require("../middleware/auth")
	
//Fonction pour afficher toutes les sauces
function getSauces(_req, res) {  
	console.log("le token a été validé, on est dans  get Sauces")
		// J'utilise la méthode "find" de mongoose pour trouver les sauces dans ma base de données
	Product.find({})
		//Response envoyée  
		.then(products => res.send(products))
		//Sinon je renvoie une erreur 500
		.catch(error => res.status(500).send(error))
}

function getSauce(req, _res) {
	const {id} = req.params			
	return Product.findById(id)
}
//Fonction qui affiche une sauce
function getSauceById(req, res) {
	getSauce(req, res).then((product) => sendClientResponse(product, res))
		//Sinon je renvoie une erreur
		.catch((err) => res.status(500).send(err))
}
//Fonction pour supprimer une sauce
function deleteSauce(req, res) {
	const {	id} = req.params		
		// 1. L'ordre de suppression de produit est envoyé à Mongoo 
       //Je trouve ma sauce avec son ID dans la requête	     
    Product.findOne({_id:id})
		.then((product) => {
		if(product._Id === req.body.userId) {
			deleteImage(product);
            
			//Je supprime la sauce avec la propriété "deleteOne" de MongoDB
			//double vérifications,  l'Id de la sauce et l'Id de l'utilisateur
			Product.deleteOne({_id: req.params.id}, {deleteSauce: req.body.userId})											
				//Response 200 envoyée
				.then(() => res.status(200).json({
					message: "La Sauce a été supprimée !"
				}))
				//Sinon je renvoie une erreur 400
				.catch((error) => res.status(400).json({
					error
				}));
                
		} else {
			return res.status(403).json({
				message: "Vous n'avez pas le droit de supprimer cette sauce",
			});
		}	
	});   
}

async function deleteImage(product) {
	const imageToDelete = product.imageUrl.split("/images/").at(-1)
	await fs.unlink("images/" + imageToDelete)
	return product    
}

//Fonction pour modifier une sauce
function modifySauce(req, res) {
	//Récupere des données de la requete
	const {id }= req.params	
		
		//J'ai mis une variable hasNewImage si oui ou non il y a nouvelle image qui a été updatée
	const hasNewImage = req.file != null
	const payload = makePayload(hasNewImage, req)
    //Je mets à jour la sauce dans ma base de données en vérifiant l'ID 
	Product.findByIdAndUpdate(id, payload)
    .then((product) => {
			if(product._Id === req.body.userId) {		
                //Je mets à jour la sauce dans ma base de données en vérifiant l'ID 
				product.updateOne({ _id: req.params.id }, { ...hasNewImage, _id: req.params.id })
                .then((dbRespance) => sendClientResponse(dbRespance, res))          
                .catch((err) => console.error("Problem Updating", err)) //si il y a un probleme de connexion a la base de données          
    } else {
            return res.status(403).json({ message: "Vous n'avez pas le droit de modifié cette sauce"})                  
        }	
})
}
function makePayload(hasNewImage, req) {
	//S'il n'y a pas de nouvelle image
	console.log("hasNewImage:", hasNewImage)   
	if(!hasNewImage) return req.body  
    //je convertie les données en format JSON
	const payload = JSON.parse(req.body.sauce)
    console.log(payload)
	//chemin vers les images
	payload.imageUrl = makeImageUrl(req, req.file.filename)
	console.log("NOUVELLE IMAGE A GERER il y a un image");
	console.log("Voici le payload:", payload)
	return payload
}
 //un fonction qui va renvoyer la reponse au client
function sendClientResponse(product, res) {
	if(product == null) {
		console.log("Nothing To Update")
		return res.status(404).send({
			message: "Object not found in database"
		})
	}	
	return Promise.resolve(res.status(200).send(product)).then(() => product)
}

function makeImageUrl(req, filename) {
	return req.protocol + '://' + req.get('host') + "/images/" + filename
}

//J'ai fabriqué un sauce 
function createSauce(req, res) {
	const {body, file} = req
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
		likes: 0,
		dislikes: 0,
		usersLiked: [],
		usersDisliked: []
	})
	product.save().then((message) => {
		res.status(201).send({
			message: message
		})
		return console.log("produit enregistré")
	}).catch(console.error)
}

function likeSauce(req, res) {
	const {like, userId} = req.body		
	if(![0, -1, 1].includes(like)) return res.status(400).send({
		message: "Invalid like value"
	})
	getSauce(req, res)
	.then((product) => updateVote(product, like, userId, res))
	.then(pr => pr.save()) //save le produit dans les base de données
	.then(prod => sendClientResponse(prod, res))
	.catch((err) => res.status(500).send(err))
}
function updateVote(product, like, userId, res) {
	if(like === 1 || like === -1) return incrementvote(product, userId, like)
	return resetVote(product, userId, res) //si ce que je devais annuler c'est un like ou un dislike
}
function incrementvote(product, userId, like) {
	const usersLiked = product.usersLiked
	const usersDisliked = product.usersDisliked
	const votersArray = like === 1 ? usersLiked : usersDisliked
	if(votersArray.includes(userId)) return product
	votersArray.push(userId)
	if(like === 1) {
		++product.likes
	} else {
		++product.dislikes
	}
	return product
}
//Si like === 0
function resetVote(product, userId, _res) {
	const {usersLiked, usersDisliked} = product			
	//les array qui ont  l'userid
	if([usersLiked, usersDisliked].every((arr) => arr.includes(userId))) return Promise.reject("User seems to have voted both ways") //pour aller à la catch
	// les userId ne sont pas dans les deux array(usersliked et usersDisliked) soit dans une des deux soit dans aucune des deux
		//Aucun array qui gere les userid
	if(![usersLiked, usersDisliked].some((arr) => arr.includes(userId))) return Promise.reject("User seems to not have  voted ")
		//supprimer un élément dans un array
		//pour trouver l array qui inclut les userid et verify le
	if(usersLiked.includes(userId)) {
		--product.likes
		product.usersLiked = product.usersLiked.filter(id => id !== userId) //renvoie un array ou chaque élement aura différent du userid
	} else {
		--product.dislikes
		product.usersDisliked = product.usersDisliked.filter(id => id !== userId)
	}
	return product
}
module.exports = {
	getSauces, createSauce, getSauceById, deleteSauce, modifySauce, likeSauce, authenticateUser
}