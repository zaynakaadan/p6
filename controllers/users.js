const {
  User
} = require("../mongo")
// Module de hash Mot De Passe
const bcrypt = require("bcrypt")
// Authentification avec un TOKEN utilisateur unique
const jwt = require("jsonwebtoken")

//Fonction d'inscription
async function createUser(req, res) {
  try {
      const {
          email
          , password
      } = req.body
      const hashedPassword = await hashPassword(password)
      
      const user = new User({
          email: email
          , password: hashedPassword
      })
      await user.save()
      res.status(201)
          .send({
              message: "Utilisateur enregistré "
          })
  } catch (err) {
      res.status(409)
          .send({
              message: "User pas enregistré :" + err
          })
  }
}

function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds)
}
async function logUser(req, res) {
  try {
      const email = req.body.email
      const password = req.body.password
      const user = await User.findOne({
          email: email
      })
      if (!user) {
          return res.status(403)
              .json({
                  error: 'Utilisateur non trouvé !'
              });
      }
      const ispasswordok = await bcrypt.compare(password, user.password)
      if (!ispasswordok) {
          res.status(403)
              .send({
                  message: "Mot de passe incorrect"
              })
      }
      const token = createToken(email)
      res.status(200)
          .send({
              userId: user._id
              , token: token
          })
  } catch (err) {
      console.error(err)
      res.status(500)
          .send({
              message: "Erreur interne"
          })
  }
}
//login avec bon mot de passe
function createToken(email) {
  const jwtpassword = process.env.JWT_PASSWORD
  const token = jwt.sign({
      email: email
  }, jwtpassword, {
      expiresIn: "24h"
  })
  console.log('token:', token)
  return token
}
module.exports = {
  createUser
  , logUser
}
