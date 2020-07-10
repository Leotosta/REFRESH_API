const express = require('express')
const app = express()
const port = 4000 || process.env.PORT
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
require('dotenv').config()

app.use(morgan('common'))
app.use(cookieParser())
app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors({
    origin: process.env.CORS,
    credentials: true
}))

require('./control/index')(app)

app.listen(port, () => {
    console.log(`Magic happening on port ${port} `)
})