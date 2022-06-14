
console.log("Voila du code JavaScript !")
const {app, express} = require("./server")
const {saucesRouter} = require("./routers/sauces.router")
const {authRouter} = require("./routers/auth.router")
const bodyparser = require("body-parser")
const port = 3000
const path = require('path')
const bodyParser = require("body-parser")

// Connection to database
require("./mongo")

// Controllers


//Middleware
app.use(bodyParser.json())
app.use("/api/sauces" , saucesRouter)
app.use("/api/auth" , authRouter)
//Routes
app.get("/", (req, res) =>
    res.send("Hello World! new test"))

// Listen   
app.use("/images",express.static(path.join(__dirname, "images")))
app.listen(port, () => console.log("listening on port"+ port))





