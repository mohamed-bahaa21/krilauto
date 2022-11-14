const express = require('express');
const router = express.Router();
const { upload } = require('../services/multer')
let mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const Users = require('../models/Users.models');
const Reserves = require('../models/Reserves.models');
const Agencies = require('../models/Agencies.models')

const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../services/auth');


// ===================================
router.get('/', (req, res) => res.render('index', { user: req.user }));

// User Signout
router.get('/signout', (req, res) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth');
  });

});

// User Profile
router.get('/profile', ensureAuthenticated, (req, res) => {

  try {
    Reserves.find({ '_id': { $in: req.user.reserves } }).then(reserves => {
      res.render('profile', {
        user: req.user,
        reserves: reserves
      });
    });

  } catch (error) {
    req.flash(
      'success_msg',
      'Error happened'
    );
    res.redirect('/');
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
const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
const { createOrder, capturePayment } = require('../services/paypal')

// create a new order
router.post("/create_reserve", async (req, res) => {
  let { carId,
    carName,
    startDate,
    endDate,
    price } = req.body;


  let new_reserve = new Reserves({
    ownerId: req.user._id,
    carId: carId,
    ownerName: req.user.name,
    carName: carName,
    startDate: startDate,
    endDate: endDate,
    price: price,
    fullFilled: false,
  })
  req.user.cart = new_reserve._id;
  new_reserve.save().then(() => {
    req.flash('success_msg', "Reserve was created Successfully");
    res.redirect('/reserve');
  })
});

router.get('/reserve', async (req, res) => {
  try {
    Reserves.findOne({ _id: req.user.cart }).then(reserve => {
      res.render('reserve', {
        user: req.user,
        reserve: reserve,
      });
    });

  } catch (error) {
    res.render('reserve', {
      user: req.user,
    });
  }
});

// create a new order
router.post("/reserve", async (req, res) => {
  const order = await createOrder();
  res.json(order);
});

// capture payment & store order information or fullfill order
router.post("/reserve/:reserveID/capture", async (req, res) => {
  const { reserveID } = req.params;
  const captureData = await capturePayment(reserveID);
  // TODO: store payment information such as the transaction ID
  res.json(captureData);
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
// User Car
router.post('/search', async (req, res) => {
  let { car_name, dates, city_name } = req.body;
  let date_sample = "01/02/2022 - 24/03/2022";
  let start_date = dates.slice(0, 10);
  let end_date = dates.slice(13, 23);
  // res.send({ car_name, start_date, end_date, city_name });
  try {
    // const car = await Cars.findOne({ name: req.params.car });
    res.render('search', {
      user: req.user,
      car_name, start_date, end_date, city_name,
    });
  } catch (error) {
    res.render('search', {
      user: req.user,
      car_name, start_date, end_date, city_name,
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
router.get('/auth', forwardAuthenticated, (req, res) => res.render('auth', { user: req.user, }));
// User Signup
router.post('/signup', (req, res) => {
  const {
    name,
    email,
    password,
    confirm_password
  } = req.body;
  let errors = [];

  if (!name || !email || !password || !confirm_password) {
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
    res.render('auth', {
      user: req.user,
      errors,
      name,
      email,
      password,
      confirm_password
    });
  } else {

    console.log(req.body.user_type);
    if (req.body.user_type == 'User') {
      Users.findOne({
        email: email
      }).then(user => {
        if (user) {
          errors.push({
            msg: 'Email already exists'
          });
          res.render('auth', {
            user: req.user,
            errors,
            name,
            email,
            password,
            confirm_password
          });
          console.log('here');
        } else {
          const newUser = new Users({
            name,
            email,
            password,
          });
          console.log('here');
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash(
                    'success_msg',
                    'You are now signuped and can sign in'
                  );
                  console.log('here');
                  res.redirect('/auth');
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
    }

    if (req.body.user_type == 'Agency') {
      Agencies.findOne({
        email: email
      }).then(user => {
        if (user) {
          errors.push({
            msg: 'Email already exists'
          });
          res.render('auth', {
            user: req.user,
            errors,
            name,
            email,
            password,
            confirm_password
          });
        } else {
          const newUser = new Agencies({
            name,
            email,
            password,
          });

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUsers.password, salt, (err, hash) => {
              if (err) throw err;
              newUsers.password = hash;
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
  }
});

// User Signin
router.post('/signin', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/auth',
    failureFlash: true
  })(req, res, next);
});

module.exports = router;