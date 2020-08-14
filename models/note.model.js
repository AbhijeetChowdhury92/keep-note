// import {Schema,model} from "mongoose"
const mongoose = require('mongoose')
const noteSchema = new mongoose.Schema({
    title:{type:String},
    body:{type:String,required:true},
    image:{type:String},
    noteColor:{type:String},
    creator:{type:String,required:true}
},{
    timestamps:true
})

const Note = mongoose.model('Note',noteSchema)

module.exports = Note