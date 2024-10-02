const multer = require('multer')
const path = require('path')

//storage
const storage = multer.diskStorage({
destination: (req , file , cb) =>{
    cb(null, './storage')
},
filename:(req , file , cb) =>{
    cb(null, `${Date.now()}_${file.originalname}`)
}
})

  const upload = multer({ storage: storage })

  module.exports = upload;



  