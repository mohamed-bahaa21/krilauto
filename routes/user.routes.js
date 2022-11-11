const express = require('express');
const router = express.Router();
const { upload } = require('../services/multer')

const Users = require('../models/Users.models');
const Reserves = require('../models/Reserves.models');
const Agencies = require('../models/Agencies.models')

const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../services/auth');


// ===================================
router.get('/', forwardAuthenticated, (req, res) => res.render('index'));

// User Signout
router.get('/signout', (req, res) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth');
  });

});

// User Profile
router.get('/profile', ensureAuthenticated, async (req, res) => {
  if (req.session.userData) {
    res.render('profile', {
      user: req.user,
      userData: req.session.userData
    });

  } else {
    try {
      // let reserves = await Reserves.find({ '_id': { $in: req.user.reserves } });
      Users.find({ _id: req.user._id }).populate('reserves.reserveId').then(user_data => {
        // note that data is an array of objects, not a single object!
        res.render('profile', {
          user: req.user,
          userData: user_data
        });
      });
    } catch (error) {
      req.flash(
        'success_msg',
        'Error happened'
      );
      res.redirect('/');
    }
  }
});

// User Profile Reserve
router.get('/profile/:reserve', ensureAuthenticated, async (req, res) => {
  try {
    let reserve = await Reserves.findById({ '_id': req.params.reserve });
    if (reserve) {
      res.render('/profile/reserve', {
        user: req.user,
        userData: req.session.userData
      });
    }
  } catch (error) {
    res.render('/profile/reserve', {
      user: req.user,
    });
  }
});

// User Reserve
router.get('/reserve', async (req, res) => {
  try {
    const reserve = await Reserves.findOne({ _id: req.session.userData.cart });
    if (reserve) {
      res.render('reserve', {
        user: req.user,
        reserve: reserve,
      });
    }
  } catch (error) {
    res.render('reserve', {
      user: req.user,
    });
  }
});

// User News
router.get('/news', async (req, res) => {
  res.render('news', {
    user: req.user,
  });
})

// User Agency
router.get('/agency/agency', async (req, res) => {
  try {
    const agency = await Agencies.findOne({ name: req.params.agency }).populate('cars.carId');
    res.render('agency', {
      user: req.user,
      agency: agency,
    });
  } catch (error) {
    res.render('agency', {
      user: req.user,
    });
  }
});

// User Car
router.get('/car/car', async (req, res) => {
  try {
    const car = await Cars.findOne({ name: req.params.car });
    res.render('car', {
      user: req.user,
      car: car,
    });
  } catch (error) {
    res.render('car', {
      user: req.user,
    });
  }
});

// =========================================================

router.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      res.redirect('/profile');
    } else {
      res.render('profile', {
        user: req.user,
        users: usersdata,
        file: `../public/uploads/${req.file.filename}`
      });
      res.redirect('/profile');
    }
  });
});

// User Auth
router.get('/auth', forwardAuthenticated, (req, res) => res.render('auth'));
// User Signup
router.post('/signup', (req, res) => {
  const {
    name,
    email,
    password,
    confirm_password
  } = req.body;
  let errors = [];

  if (!name || !workAs || !email || !password || !confirm_password) {
    errors.push({
      msg: 'Please enter all fields'
    });
  }

  if (password != confirm_password) {
    errors.push({
      msg: 'Passwords do not match'
    });
  }

  if (password.length < 6) {
    errors.push({
      msg: 'Password must be at least 6 characters'
    });
  }

  if (errors.length > 0) {
    res.render('signup', {
      errors,
      name,
      email,
      password,
      confirm_password
    });
  } else {
    User.findOne({
      email: email
    }).then(user => {
      if (user) {
        errors.push({
          msg: 'Email already exists'
        });
        res.render('signup', {
          errors,
          name,
          email,
          password,
          confirm_password
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now signuped and can log in'
                );
                res.redirect('/auth');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// User Signin
router.post('/signin', (req, res, next) => {
  User.findOne({
    email: req.body.email
  }, (err, doc) => {
    if (err) {
      console.log("Something wrong when updating data!");
    } else {
      passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/auth',
        failureFlash: true
      })(req, res, next);
    }
  });
});

module.exports = router;