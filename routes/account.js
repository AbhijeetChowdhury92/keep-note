require('dotenv').config()
const router = require('express').Router()
const md5 = require('md5')
const jwt = require('jsonwebtoken')
let User = require('../models/user.model')


router.route('/login').post((req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user)
               return res.status(404).json('User not found')
            if (user.password === md5(req.body.password)) {
                const accessToken = jwt.sign({userID:user._id}, process.env.ACCESS_TOKEN_SECRET)
               return res.status(200).json({ accessToken,user })
            }

            return res.status(201).json('Invalid Email ID or Password')
        })
        .catch(err =>{return res.status(400).json(`Error = ${err}`)})
})
module.exports = router