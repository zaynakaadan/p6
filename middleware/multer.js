const multer = require("multer")
const storage = multer.diskStorage({ destination: "images/", filename: makeFilename })

function makeFilename(_req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname)
    file.makeFilename = makeFilename
}
const upload = multer({ storage: storage })
module.exports = { upload }
