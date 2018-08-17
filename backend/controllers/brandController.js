var fs = require("fs-extra"); // file system
var ncp = require("ncp").ncp; // copy files
const multer = require("multer"); // image uplaoder

// Model
var Brand = require("../models/brandModel");

/* UPLOAD IMAGE */
exports.storeBrandImage = function(req, res) {
    /* storage settings */
    var storeFile = multer.diskStorage({
        destination: function(req, file, callback) {
            let folderDest =
                "./dist/electro-vision/assets/uploads/brands/" + req.params.id + "/";
                if (!fs.existsSync(folderDest)) {
                    fs.mkdir(folderDest, (error) => { console.log(error) });
                }
                callback(null, folderDest);
        },
        filename: function(req, file, callback) {
            callback(null, file.originalname);
        }
    });
    /* upload settings */
    var uploadFile = multer({ storage: storeFile }).single("file");
    /* backup settings */
    ncp.limit = 16;
    var originalFolder = './dist/electro-vision/assets/uploads';
    var backupFolder = './backup';
    /* upload image */
    uploadFile(req, res, function(err) {
        if (err) {
            return res.status(501).json({ error: err });
        }
        ncp(originalFolder, backupFolder, function(err) {
            if (err) {
                return console.error(err);
            }
        });
        res.status(200).json({
            path: req.file.path,
            image: req.file.originalname,
            uploadName: req.file.filename
        });
    });
}

/* CREATE NEW */
exports.createBrand = function(req, res, next) {
    var brandNew = new Brand({
        name: req.body.name,
        description: req.body.description,
        slug: req.body.slug,
        image: "./assets/uploads/brands/default.jpg"
    });
    brandNew.save()
        .then( brand => {
            res.status(201).json({ object: brand });
        })
        .catch( error => {
            res.status(500).json({ object: error });
        })
}

/* GET ALL */
exports.getAllBrands = (req, res, next) => {
    Brand.find()
        .then( brandList => {
            if(brandList) {
                res.status(200).json({ object: brandList })
            } else {
                res.status(404).json();
            }
        })
        .catch( error => {
            res.status(500).json({ object: error });
        });
}

/* GET BY SLUG */
exports.getOneBrand = function(req, res, next) {
    Brand.findOne({ slug: req.params.slug })
        .then( brand => {
            if(brand) {
                res.status(200).json({ object: brand })
            } else {
                res.status(404).json();
            }
        })
        .catch( error => {
            res.status(500).json({ object: error });
        })
}

/* UPDATE ONE */
exports.updateBrand = function(req, res, next) {
    let imagePath =  req.body.image;
    if (req.body.image.split( '/' ).length < 2) {
        imagePath = "./assets/uploads/brands/" + req.params.id +  "/" +  req.body.image;
    };
    var brandUpdated = ({
        name: req.body.name,
        description: req.body.description,
        slug: req.body.slug,
        image: imagePath
    });
    Brand.findOneAndUpdate({ _id: req.params.id }, { $set: brandUpdated})
        .then( brand => {
            res.status(200).json({ object: brand })
        })
        .catch( error => {
            res.status(500).json({ object: error });
        })
}

/* DELETE ONE */
exports.deleteBrand = function(req, res, next) {
    Brand.findOneAndRemove( {  _id: req.params.id } )
        .then( brand => {
            let folderDest = "./dist/electro-vision/assets/uploads/brands/" + req.params.id + "/";
            if (fs.existsSync(folderDest)) {
                fs.remove(folderDest).then( console.log('deleted brand') );
            }
            res.status(200).json({ object: brand })
        })
        .catch( error => {
            res.status(500).json({ object: error });
        });
}