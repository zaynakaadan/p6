const multer = require("multer")
const storage = multer.diskStorage({destination: "images/", filename:makeFilename })

function makeFilename(req, file, cb){
    //console.log('req,file:', req,file)
    cb(null, Date.now() + "-" + file.originalname)
    file.makeFilename = makeFilename
    //console.log({file})
}
const upload = multer({ storage: storage })
module.exports = {upload}