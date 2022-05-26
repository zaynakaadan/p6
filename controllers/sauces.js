const jwt = require("jsonwebtoken")//Jsonwebtoken est utilisé pour chiffrer et déchiffrer les tokens

function getSauces(req,res){
const header = req.header("Authorization")

  //si le header undefined
if (header == null) return res.status(403).send({message:"Invalid"})

  //Je coupe la requête du header pour n'avoir que le TOKEN
const token = header.split(" ")[1]

//Le TOKEN est décodé avec la clé secrète
const decoded = jwt.verify(token, process.env.JWT_PASSWORD, (err, decoded)=> handleToken(err, decoded, res))
}

function handleToken(err, decoded,res){
if (err) res.status(403).send({message:"Token invalid" +err})
else {
    console.log("le Token est ok", decoded)
    res.send({message:"voici tous les sauces"})
}
}
module.exports = {getSauces}