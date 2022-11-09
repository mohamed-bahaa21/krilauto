const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Load User model
const User = require('../models/Users.models');

const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../services/auth');

// Admin Signin
router.get('/signin', (req, res, next) => {
  res.render('admin/signin', {});
});

router.post('/signin', (req, res, next) => {
  if (req.body.email == 'admin@admin.com' && req.body.password == "admin123") {

    passport.authenticate('local', {
      successRedirect: '/admin/dashboard',
      failureRedirect: '/admin/login',
      failureFlash: true
    })(req, res, next);

  } else {
    req.flash('fail_msg', 'try again');
    res.redirect('/admin/signin');
  }
});

// Admin Signout
router.get('/signout', (req, res) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/admin/signin');
  });

});

// Admin Books
router.get('/dashboard', (req, res) => {
  res.render('admin/dashboard', {
    user: req.user,
  });
});

// Admin Books
router.get('/admin/books', ensureAuthenticated, async (req, res) => {
  const users = await Users.find({});

  res.render('admin/books', {
    user: req.user,
    users: users,
  });
});


module.exports = router;