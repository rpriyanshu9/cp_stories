const express = require('express');
const path = require('path')
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

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//Handlebars
app.engine('.hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
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

// static folder
app.use(express.static(path.join(__dirname, 'public')))

//ROutes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))

const PORT = process.env.PORT || 3000


app.listen(PORT, console.log(`Server running in  ${process.env.NODE_ENV} mode on port ${PORT}`))

