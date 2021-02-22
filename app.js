const express = require('express');
const path = require('path')
const methodOverride = require('method-override')
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDb = require('./config/db')
const exphbs = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session)

//load config
dotenv.config({ path: './config/config.env' });

//passport config
require('./config/passport')(passport)

connectDb()

const app = express()

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Method override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// HandleBars Helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helper/hbs')

//Handlebars
app.engine('.hbs', exphbs({ helpers: { formatDate, stripTags, truncate, editIcon, select }, defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', '.hbs')

// Sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}))

// Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

// Global Variables
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

// static folder
app.use(express.static(path.join(__dirname, 'public')))

//ROutes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000


app.listen(PORT, console.log(`Server running in  ${process.env.NODE_ENV} mode on port ${PORT}`))

