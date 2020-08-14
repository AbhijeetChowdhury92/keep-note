const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName:{type:String,required:true,minlength:3},
    lastName:{type:String},
    email:{type:String,required:true,unique:true,match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']},
    mobileNumber:{type:Number,required:true,minlength:10,maxlength:10},
    password:{type:String,required:true,minlength:8},
    profilePic:{type:String}
},{
    timestamps:true
})

const User = mongoose.model('User',userSchema)

module.exports=User