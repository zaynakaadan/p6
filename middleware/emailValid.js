//Ici sont définies les règles REGEX pour plus de sécurité  
// Pour que l'utilisateur utilise un vrai email pour créer un compte 
                            
module.exports = ( req, res, next) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)){
    next()   } else {
       // si l'Email ne correspond pas aux règles, ou si l'utilisateur a fait une erreur le compte n'est pas créé et un message d'erreur est envoyé 
     //  à l'utilisateur pour qu'il puisse voir l'erreur      
res.status(400).json({message : "L'Email renseigné est incorrect !"}) 
}
}