const express = require('express');
const router = express.Router();
const { upload } = require('../services/multer')
let mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;
// const Date = mongoose.Schema.Types.Date;
const bcrypt = require('bcryptjs');
const passport = require('passport');

const Users = require('../models/Users.models');
const Agencies = require('../models/Agencies.models')
const Reserves = require('../models/Reserves.models');
const Cars = require('../models/Cars.models');

const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../services/auth');


// ===================================
router.get('/set-lang/:lang', (req, res) => {
  let refer = req.headers.referrer || req.headers.referer;
  req.session.ulang = req.params.lang;
  res.redirect(refer);
});

router.get('/', (req, res) => {
  Cars.find().sort({ freeFrom: -1 }).limit(9).then(cars => {
    res.render('index', {
      user: req.user,
      cars: cars
    })
  })
});

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

  let account_type = req.user.account_type;
  // console.log('====================================');
  // console.log(account_type);
  // console.log('====================================');
  if (account_type == "User") {
    try {
      Reserves.find({ '_id': { $in: req.user.reserves }, fullFilled: true }).then(reserves => {
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
  }

  if (account_type == "Agency") {

    // console.log(req.user.cars);
    // let IdsArr = req.user.cars.map(id => ObjectID(id));
    try {
      res.render('agency-profile', {
        user: req.user,
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

router.get('/profile/cars', ensureAuthenticated, (req, res) => {
  let carId = req.params.carId;

  Cars.find({ _id: { $in: req.user.cars } }).then(cars => {
    // res.send(cars)
    res.render('agency-cars', {
      user: req.user,
      cars: cars
    })
  });

})

router.post('/agency-add-car', ensureAuthenticated, (req, res, next) => {
  let { agencyId,
    name,
    price,
    city,
    brand,
    model,
    description, freeFrom } = req.body;

  let isFree;
  if (freeFrom == "") {
    freeFrom = "Now";
    isFree = true;
  } else {
    isFree = false;
  }

  // console.log(req.user);
  // res.send({ user: req.user, data: req.body });

  let newCar = new Cars({
    agencyId: req.user._id,
    name, price, city, brand, model, description, isFree, freeFrom,
  })
  // 6372dda87738c9ca6aa58f3c

  newCar.save().then(() => {
    Agencies.findOneAndUpdate({ _id: req.user._id }, { $push: { cars: newCar._id } })
      .then(() => {
        req.flash('success_msg', 'Car Added Successfully')
        res.redirect('/profile');
      }).catch(err => {
        console.log(err);
        res.redirect('/')
      })
  })
})
router.get('/profile/cars/:carId', ensureAuthenticated, (req, res) => {
  let carId = req.params.carId;
  Cars.findOne({ _id: carId }).then(car => {
    res.render('agency-update-car', {
      user: req.user,
      car: car
    })
  })
})
router.post('/profile/cars/:carId', ensureAuthenticated, (req, res) => {
  let carId = req.params.carId;

  let { name, price, city, brand, model, description, freeFrom } = req.body;

  let isFree;
  if (freeFrom == "") {
    freeFrom = Date.now();
    isFree = true;
  } else {
    isFree = false;
  }

  Cars.findOneAndUpdate({ _id: carId }, { name, price, city, brand, model, description, isFree, freeFrom }).then(car => {
    req.flash('success_msg', 'Car was updated successfully');
    res.redirect('/profile/cars');
  })
})

router.delete('/profile/cars/delete/:carId', ensureAuthenticated, (req, res) => {
  let carId = req.params.carId;
  Cars.findOneAndDelete({ _id: carId }).then(() => {
    Agencies.findOneAndUpdate({ _id: req.user._id }, { $pull: { cars: carId } }).then(() => {

      req.flash('success_msg', 'Car was deleted successfully');
      res.redirect('/profile/cars');

    })
  })
})

// Agency Profile Reserve
router.get('/profile/reserves', ensureAuthenticated, async (req, res) => {
  try {
    let reserves = await Reserves.find({ agencyId: req.user._id });
    if (reserves) {
      res.render('agency-reserves', {
        user: req.user,
        reserves: reserves
      });
    }
  } catch (error) {
    res.render('agency-reserves', {
      user: req.user,
    });
  }
});
router.get('/profile/reserves/:reserveId', ensureAuthenticated, async (req, res) => {
  try {
    let reserve = await Reserves.findById({ _id: req.params.reserveId });
    if (reserve) {
      res.render('/profile/reserve', {
        user: req.user,
        reserve: reserve
      });
    }
  } catch (error) {
    res.render('/profile/reserve', {
      user: req.user,
    });
  }
});
// End Agency
// ===========================================================================

// User Reserve
const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
const { createOrder, capturePayment } = require('../services/paypal');

router.get('/reserves', ensureAuthenticated, async (req, res) => {
  try {
    Reserves.find({ '_id': { $in: req.user.reserves }, fullFilled: false }).then(reserves => {
      if (reserves) {
        res.render('reserves', {
          user: req.user,
          reserves: reserves,
        });
      } else {
        res.render('reserves', {
          user: req.user,
          reserves: "no reserves",
        });
      }
    });
  } catch (error) {
    res.render('reserves', {
      user: req.user,
      reserves: "no reserves",
    });
  }
});
function treatAsUTC(date) {
  var result = new Date(date);
  result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
  return result;
}

function daysBetween(startDate, endDate) {
  var millisecondsPerDay = 24 * 60 * 60 * 1000;
  return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

// create a new order
router.post("/user-create-reserve", async (req, res) => {
  let { userId, carId, agencyId,
    agencyName, carName, carPrice, carCity, dates } = req.body;

  let start_date = dates.slice(0, 10);
  let end_date = dates.slice(13, 23);

  numberOfDays = daysBetween(start_date, end_date) + 1;

  let new_reserve = new Reserves({
    userId: req.user._id,
    agencyId: agencyId,
    carId: carId,
    userName: req.user.name,
    agencyName: agencyName,
    carName: carName,
    carPrice: carPrice * numberOfDays,
    startDate: start_date,
    endDate: end_date,
    fullFilled: false,
  })

  req.user.cart = new_reserve._id;
  new_reserve.save().then(() => {
    Users.findOneAndUpdate({ _id: req.user._id }, { $push: { reserves: new_reserve._id } }).then(() => {
      Agencies.findOneAndUpdate({ _id: agencyId }, { $push: { reserves: new_reserve._id } }).then(() => {
        req.flash('success_msg', "Reserve was created Successfully");
        res.redirect('/reserves');
      })
    })
  })

});

router.get('/user-delete-reserve/:reserveId', ensureAuthenticated, (req, res) => {
  let reserveId = req.params.reserveId;
  Reserves.findOneAndDelete({ _id: reserveId }).then(() => {
    Agencies.findOneAndUpdate({ _id: req.user._id }, { $pull: { reserves: reserveId } }).then(() => {
      Users.findOneAndUpdate({ _id: req.user._id }, { $pull: { reserves: reserveId } }).then(() => {

        req.flash('success_msg', 'Car was deleted successfully');
        res.redirect('/reserves');

      })
    })
  })
})

// create a new order
router.get("/reserves/:reserveId", async (req, res) => {
  Reserves.findOne({ _id: req.params.reserveId }).then((reserve) => {
    res.render('reserves-reserve', {
      user: req.user,
      reserve: reserve,
    });
  })
});

router.post("/reserves/:reserveId", async (req, res) => {
  const order = await createOrder();
  res.json(order);
});

// capture payment & store order information or fullfill order
router.post("/reserves/:reserveID/capture", async (req, res) => {
  const { reserveID } = req.params;
  let { orderId } = req.body;
  const captureData = await capturePayment(orderId);

  if (captureData) {
    Reserves.findOneAndUpdate({ _id: reserveID }, { orderId: orderId, fullFilled: true }).then(() => {
      res.json(captureData);
    })
  }
});

// User Agency
router.get('/agencies/:agencyId', async (req, res) => {
  try {
    if (req.user.allowed_agencies.includes(agencyId)) {
      console.log('here');
      Agencies.findOne({ _id: req.params.agencyId }).populate('cars').then(agency => {
        res.render('agency', {
          user: req.user,
          agency: agency,
        });
      })
    } else {
      res.render('agency', {
        user: req.user,
        agency: "signin first",
      });
    }
  } catch (error) {
    res.render('agency', {
      user: req.user,
      agency: "signin first",
    });
  }
});

// User Car
router.get('/cars/:carId', async (req, res) => {
  try {
    Cars.findOne({ _id: req.params.carId }).populate('agencyId').then(car => {
      res.render('car', {
        user: req.user,
        car: car,
      });
    });
  } catch (error) {
    res.render('car', {
      user: req.user,
    });
  }
});

const url = require('url');
const querystring = require('querystring');

// User Car
router.get('/search', async (req, res) => {
  let { city_name, start_date, end_date } = req.session.search;
  let { model } = req.query;

  if (!city_name || !start_date || !end_date || !model) return res.redirect('/')

  try {
    Cars.find({
      city: city_name,
      freeFrom: {
        $gte: new Date(start_date),
        $lt: new Date(end_date)
      },
      model: model
    }).then(cars => {
      res.render('search', {
        user: req.user,
        cars: cars,
        start_date, end_date, city_name,
      });
    })

  } catch (error) {
    res.render('search', {
      user: req.user,
      start_date, end_date, city_name,
    });
  }
});
// User Car
router.post('/search', async (req, res) => {
  let { dates, city_name } = req.body;
  // let date_sample = "01/02/2022 - 24/03/2022";
  let start_date = dates.slice(0, 10);
  let end_date = dates.slice(13, 23);

  req.session.search = { city_name, start_date, end_date }
  // res.send({ car_name, start_date, end_date, city_name });

  try {
    Cars.find({
      city: city_name, freeFrom: {
        $gte: new Date(start_date),
        $lt: new Date(end_date)
      }
    }).then(cars => {
      res.render('search', {
        user: req.user,
        cars: cars,
        start_date, end_date, city_name,
      });
    })

  } catch (error) {
    res.render('search', {
      user: req.user,
      start_date, end_date, city_name,
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
router.get('/auth', forwardAuthenticated, (req, res) => {
  console.log(req.session.ulang);
  res.render('auth', { user: req.user, })
});
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
  }
});

// User Signin
router.post('/signin', (req, res, next) => {
  let { user_type } = req.body;

  if (req.user) {
    req.flash('success_msg', "signout first, admin !!");
    return res.redirect('/')
  }

  if (user_type == "User") {
    require('../services/user.passport')(passport);
    passport.authenticate('user-local', {
      successRedirect: '/profile',
      failureRedirect: '/auth',
      failureFlash: true
    })(req, res, next);
  }

  if (user_type == "Agency") {
    require('../services/agency.passport')(passport)
    passport.authenticate('agency-local', {
      successRedirect: '/profile',
      failureRedirect: '/auth',
      failureFlash: true
    })(req, res, next);
  }
});

module.exports = router;



function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}