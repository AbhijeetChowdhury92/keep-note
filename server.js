require('dotenv').config()
const compression = require('compression')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 5000
const URI = process.env.UAT_DB_URI

app.use(compression())
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.use('/',express.static(path.join(__dirname, 'client')));
mongoose.connect(URI,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
})

const connection = mongoose.connection

connection.once('open',()=>{
    console.log('MongoDB connection established')
})

const usersRouter = require('./routes/users')
const accountRouter = require('./routes/account')
const notesRouter = require('./routes/notes')

app.use('/api/users',usersRouter)
app.use('/api/account',accountRouter)
app.use('/api/notes',notesRouter)
app.use('*',express.static(path.join(__dirname, 'client')));
app.listen(PORT,()=>{
    console.log(`Server is running on PORT: ${PORT}`)
})
