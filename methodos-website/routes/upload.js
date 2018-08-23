//Source of code http://programmerblog.net/nodejs-file-upload-tutorial/ publication: 15th April, 2018, accessed: 15 July 2018

var multer = require('multer');
var path   = require('path');

/** Storage Engine */
var storageEngine = multer.diskStorage({
  destination: './public/files',
  filename: function(req, file, fn){
    fn(null,  new Date().getTime().toString()+'-'+file.fieldname+path.extname(file.originalname));
  }
});

var upload =  multer({
  storage: storageEngine,
  limits: { fileSize:200000},
  fileFilter: function(req, file, callback){
    validateFile(file, callback);
  }
}).single('photo');

var validateFile = function(file, cb ){
  allowedFileTypes = /jpeg|jpg|png|gif/;
  var extension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  var mimeType  = allowedFileTypes.test(file.mimetype);
  if(extension && mimeType){
    return cb(null, true);
  }else{
    cb("Invalid file type. Only JPEG, PNG and GIF types are allowed.")
  }
}

module.exports = upload;
