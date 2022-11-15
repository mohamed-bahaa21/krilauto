const dotenv = require('dotenv');
dotenv.config({ silent: true });
// if (env.error) throw env.error;

const express = require('express');
// const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const multer = require('multer');
const ejs = require('ejs');
const path = require('path');

const app = express();

// Passport service Config
// require('./services/user.passport')(passport)
// require('./services/agency.passport')(passport)

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true
});

// EJS
// app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({
  extended: true
}));
// Express static folders
app.use(express.static(__dirname + '/public'));
// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Connect flash
app.use(flash());
// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/user.routes.js'));
app.use('/admin', require('./routes/admin.routes.js'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));