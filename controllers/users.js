const {User} = require("../mongo")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

async function createUser(req, res){
    try{
    const {email, password } = req.body
    const hashedPassword = await hashPassword(password)
//console.log("password:", password)
//console.log('hashedPassword:',hashedPassword)
    const user = new User({email: email , password: hashedPassword})
    await user.save() 
    res.status(201).send({message: "Utilisateur enregistré nouveau test! " })
    }catch(err){
    res.status(409).send({message:"User pas enregistré :"+ err})
 }
}
function hashPassword(password){
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds)
}

async function logUser(req, res){
    try {
    const email = req.body.email
    const password = req.body.password
    const user  =  await User.findOne({email:email})
    
    const ispasswordok =   await bcrypt.compare(password, user.password)
    if(!ispasswordok) {
    res.status(403).send({message: "Mot de passe incorrect"})
    }
    
    const token = createToken(email)
    res.status(200).send({userId: user._id, token: token})
  } catch(err){
    console.error(err)
    res.status(500).send({message:"Erreur interne"})
  }
}
//login avec bon mot de passe
function createToken(email){
const jwtpassword = process.env.JWT_PASSWORD
const token =jwt.sign({email:email}, jwtpassword, {expiresIn:"1000ms"})
console.log('token:',token)
return token
}
module.exports= {createUser, logUser}