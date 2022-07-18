const passwordValid = require('../models/passValid') 

//Création et import du module
module.exports = (req, res, next) => { 
    //Si le MDP ne correspond pas au modèle
    if (!passwordValid.validate(req.body.password)) { 
        //Message envoyé à l'utilisateur
        res.status(400).json({message : 'Votre mot de passe doit comporter au minimum un chiffre, une majuscule et aucun espace!'}) 
    } else {
        next();
    } 
} 