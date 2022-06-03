
console.log("Voila du code JavaScript !")
const {app, express} = require("./server")
const port = 3000
//const bodyParser = require ("body-parser")
const path = require('path')

// Connection to database
require("./mongo")

// Controllers
const {createUser, logUser} = require("./controllers/users")
const {getSauces, createSauce, getSauceById, deleteSauce, modifySauce} = require("./controllers/sauces")



//Middleware
const {upload} = require("./middleware/multer")
const {authenticateUser} = require("./middleware/auth")

//Routes
app.post("/api/auth/signup", createUser)  
app.post("/api/auth/login", logUser)
app.get("/api/sauces", authenticateUser, getSauces)
app.post("/api/sauces",authenticateUser, upload.single("image"), createSauce)
app.get("/api/sauces/:id", authenticateUser, getSauceById)
app.delete("/api/sauces/:id", authenticateUser, deleteSauce)
app.put("/api/sauces/:id",authenticateUser, upload.single("image"), modifySauce)
app.get("/", (req, res) =>
    res.send("Hello World! new test"))

// Listen   
app.use("/images",express.static(path.join(__dirname, "images")))
app.listen(port, () => console.log("listening on port"+ port))




