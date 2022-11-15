const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User model
const Agencies = require('../models/Agencies.models');

module.exports = function (passport) {
  passport.use('agency-local', new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // Match user
    Agencies.findOne({
      email: email
    }).select('+password').then(user => {
      if (!user) {
        return done(null, false, { message: 'That email is not registered' });
      }

      // Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Password incorrect' });
        }
      });
    });
  })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    Agencies.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
