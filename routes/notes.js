require('dotenv').config()
const express = require('express')
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
let Note = require('../models/note.model')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/notePics/');
    },
    filename: function (req, file, cb) {
        if (file) {
            req.body.image && fs.unlinkSync(`./public/uploads/notePics/${req.body.image}`)
            cb(null, `${Date.now()}${path.extname(file.originalname)}`);
        }

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
//get note created by current user
router.use(authenticateToken).route('/').get((req, res) => {
    Note.find({ creator: req.user.userID })
        .then(note => res.json(note))
        .catch(err => res.status(400).json(`Error = ${err}`))
})
//add edit note 
router.use(authenticateToken).use(upload).route('/addEditNote').post((req, res) => {
    let isImageDeleteNeeded = JSON.parse((["true", "false"].includes(req.body.isNotePicDeleted)) ? req.body.isNotePicDeleted : "false")
    if (isImageDeleteNeeded && req.body.image)
        fs.unlinkSync(`./public/uploads/notePics/${req.body.image}`)
    if (req.body._id.trim()) {
        Note.findById(req.body._id)
            .then(note => {
                note.title = (req.body.title.trim() === "") ? req.body.title : note.title
                note.body = (req.body.body.trim() === "") ? req.body.body : note.body
                note.image = req.file ? req.file.filename : (isImageDeleteNeeded ? "" : req.body.image)
                note.noteColor = (req.body.noteColor.trim() === "") ? req.body.noteColor : note.noteColor
                note.creator = req.user.userID

                note.save()
                    .then(() => res.json("Note updated"))
                    .catch(err => res.status(400).json(`Error = ${err}`))
            })
            .catch(err => res.status(400).json(`Error = ${err}`))
    }
    else {
        note = new Note({
            title: req.body.title,
            body: req.body.body,
            image: req.file ? req.file.filename : req.body.image,
            noteColor: req.body.noteColor
        })
        note.creator = req.user.userID
        note.save()
            .then(() => res.json("Note added"))
            .catch(err => res.status(400).json(`Error = ${err}`))
    }
})
//delete note
router.use(authenticateToken).route('/deleteNote').post((req, res) => {
    req.body.image && fs.unlinkSync(`./public/uploads/notePics/${req.body.image}`)
    Note.findByIdAndDelete(req.body._id)
        .then(() => res.json('Note deleted'))
        .catch(err => res.status(400).json(`Error = ${err}`))
})
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })

}
module.exports = router