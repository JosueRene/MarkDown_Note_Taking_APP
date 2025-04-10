const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000;
const path = require('path')

// Use body-parser
const bodyparser = require('body-parser')
app.use(bodyparser.urlencoded({extended: true}))
app.use(bodyparser.json())
// Use Express Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
// Use Cookie-Parser
const cookieParser = require('cookie-parser')
app.use(cookieParser())
// use cors
const cors = require('cors')
app.use(cors())
// Use dotenv
require('dotenv').config({path: "config.env"})

// Database Connection
const connectDB = require('./models/database')
connectDB()

// Use Routers
const notesRouters = require('./routers/note-router')
app.use('/notes', notesRouters)

app.listen(PORT, ()=> {
    console.log(`Server Is Running on Port ${PORT}`)
})