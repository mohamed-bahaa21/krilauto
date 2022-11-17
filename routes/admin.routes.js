const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Load User model
const Users = require('../models/Users.models');
const Agencies = require('../models/Agencies.models');

const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../services/auth');

// Admin Signin
router.get('/signin', (req, res, next) => {
  res.render('admin/signin', {
    user: req.user
  });
});

router.post('/signin', (req, res, next) => {
  if (req.body.email == 'admin@admin.com' && req.body.password == "admin123") {
    require('../services/admin.passport')(passport)
    passport.authenticate('admin-local', {
      successRedirect: '/admin/dashboard',
      failureRedirect: '/admin/signin',
      failureFlash: true
    })(req, res, next);

    // req.user = "admin";
    // req.flash('fail_msg', 'try again');
    // res.redirect('/admin/dashboard');

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

// Admin Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('admin/dashboard', {
    user: req.user,
  });
});

// Admin Dashboard Users
router.get('/dashboard/users', ensureAuthenticated, (req, res) => {
  Users.find().then((users) => {
    res.render('admin/users', {
      user: req.user,
      users: users,
    });
  });
});

// Admin Dashborad Agencies
router.get('/dashboard/agencies', ensureAuthenticated, (req, res) => {
  Agencies.find().then((agencies) => {
    res.render('admin/agencies', {
      user: req.user,
      agencies: agencies,
    });
  });
});

// Admin Verify Users
router.get('/verify-user/:userId', ensureAuthenticated, (req, res) => {
  Users.findOneAndUpdate({ _id: req.params.userId }, { verified: true }).then(() => {
    req.flash('success_msg', 'User verified successfully');
    res.redirect('/admin/dashboard/users');
  });
});
// Admin Delete Users
router.get('/delete-user/:userId', ensureAuthenticated, (req, res) => {
  Users.findOneAndDelete({ _id: req.params.userId }).then(() => {
    req.flash('success_msg', 'User deleted successfully');
    res.redirect('/admin/dashboard/users');
  });
});

// Admin Verify Agency
router.get('/verify-agency/:agencyId', ensureAuthenticated, (req, res) => {
  Agencies.findOneAndUpdate({ _id: req.params.agencyId }, { verified: true }).then(() => {
    req.flash('success_msg', 'Agency verified successfully');
    res.redirect('/admin/dashboard/agencies');
  });
});
// Admin Delete Agency
router.get('/delete-agency/:agencyId', ensureAuthenticated, (req, res) => {
  Agencies.findOneAndDelete({ _id: req.params.agencyId }).then(() => {
    req.flash('success_msg', 'Agency deleted successfully');
    res.redirect('/admin/dashboard/agencies');
  });
});


module.exports = router;