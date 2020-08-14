require('dotenv').config()
const express = require('express')
const router = require('express').Router()
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')

let User = require('../models/user.model')
const authenticateToken = (req, res, next)=> {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) return res.status(401).json('Unauthorized').send()
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json('Invalid token').send()
        req.user = user
        next()
    })

}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/profileImg/');
    },
    filename: function (req, file, cb) {
        cb(null, `${req.user.userID}${path.extname(file.originalname)}`);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }

}

// image path
// limit: 5mb
// filter : png, jpeg,jpg
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
}).single('file')

router.route('/').get((req, res) => {
    User.find()
        .then(user => res.json(user))
        .catch(err => res.status(400).json(`Error = ${err}`))
})

router.route('/add').post((req, res) => {
    User.findOne({email:req.body.email})
        .then(user=>{
            if(user)
                res.status(201).json('User already exists with the Email ID provided!')
            else{
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    mobileNumber: Number(req.body.mobileNumber),
                    password: md5(req.body.password),
                    profilePic: req.body.profilePic
                })
                newUser.save()
                    .then(() => res.json("User added"))
                    .catch(err => res.status(400).json(`Error = ${err}`))
            }
        })
        .catch(err => res.status(400).json(`Error = ${err}`))
})

router.use(authenticateToken).route('/getUser').get((req, res) => {
    User.findById(req.user.userID)
        .then(user => res.json(user))
        .catch(err => res.status(400).json(`Error = ${err}`))
})
router.route('/:id').delete((req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then(() => res.json("User Deleted"))
        .catch(err => res.status(400).json(`Error = ${err}`))
})
router.use(authenticateToken).route('/updateuser').post((req, res) => {
    User.findById(req.user.userID)
        .then(user => {
            user.firstName = (req.body.firstName.trim() !== "") && user.firstName
            user.lastName = (req.body.lastName.trim() !== "") && user.lastName
            user.email = (req.body.email.trim() !== "") && user.email
            user.mobileNumber = Number((req.body.mobileNumber.toString().trim() !== "") && user.mobileNumber)
            user.profilePic = (req.body.profilePic.trim() !== "") &&  user.profilePic
            user.save()
                .then(() => res.json("User updated"))
                .catch(err => res.status(400).json(`Error = ${err}`))
        })
        .catch(err => res.status(400).json(`Error = ${err}`))
})
router.route('/login').post((req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => res.json(user))
        .catch(err => res.status(400).json(`Error = ${err}`))
})

router.use(authenticateToken).use(upload).route('/uploadProPic').post((req, res) => {
    User.findById(req.user.userID)
        .then(user => {
            user.profilePic = req.file.filename !== "" ? req.file.filename : user.profilePic
            user.save()
                .then(() => res.json(user.profilePic))
                .catch(err => res.status(400).json(`Error = ${err}`))
        })
        .catch(err => res.status(400).json(`Error = ${err}`))
})


module.exports = router