let passwordValidator = require('password-validator'); 

let schema = new passwordValidator();

/*  Schéma de validation du MDP pour plus de sécurité  ** 
**  Le MDP doit avoir 6 caractères minimum  **
**  Une taille maximale de 100 caractères **
**  Il doit avoir au moins une majuscule  **
** Il doit avoir un minimum de une minuscule**
**  Un minimum de 1 chiffre **
**  Les espaces ne sont pas autorisés */

schema
.is().min(6)
.is().max(100)
.has().uppercase()
.has().lowercase()
.has().digits()
.has().not().spaces()                         

//Module exporté

module.exports = schema; 