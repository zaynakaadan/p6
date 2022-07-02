const jwt = require("jsonwebtoken") //Jsonwebtoken est utilisé pour chiffrer et déchiffrer les tokens

function authenticateUser(req, res, next) {
    const header = req.header("Authorization")
    //si le header undefined
    if (header == null) return res.status(403)
        .send({ message: "Invalid" })
    //Je coupe la requête du header pour n'avoir que le TOKEN
    const token = header.split(" ")[1]
    
    //Le TOKEN est décodé avec la clé secrète
    jwt.verify(token, process.env.JWT_PASSWORD, (err, decoded) => {
        if (err) return res.status(403)
            .send({ message: "Token invalid" + err })
        next()
    })
}
module.exports = { authenticateUser }
