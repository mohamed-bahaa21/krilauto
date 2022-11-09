const express = require('express');
const router = express.Router();
const { upload } = require('../services/multer')

const Users = require('../models/Users.models');

const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../services/auth');


// ===================================
router.get('/', forwardAuthenticated, (req, res) => res.render('index'));

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
                res.redirect('/signin');
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
  try {
    let books = await Books.find({ '_id': { $in: req.user.books } });
    Users.find({}, function (err, data) {
      // note that data is an array of objects, not a single object!
      res.render('profile', {
        user: req.user,
        books: books
      });
    });
  } catch (error) {
    res.render('profile', {
      user: req.user,
    });
  }
});

router.get('/profile/:book', ensureAuthenticated, async (req, res) => {
  try {
    let book = await Book.findById({ '_id': req.params.book });
    Users.find({}, function (err, data) {
      // note that data is an array of objects, not a single object!
      res.render('/profile.book', {
        user: req.user,
        book: book
      });
    });
  } catch (error) {
    res.render('/profile.book', {
      user: req.user,
    });
  }
});

// Wishlist
router.get('/wishlist', async (req, res) => {
  try {
    const wishlist = await Wishlists.findOne({ _id: req.user.wishlist }).populate('books');
    res.render('wishlist', {
      user: req.user,
      wishlist: wishlist,
    });
  } catch (error) {
    res.render('wishlist', {
      user: req.user,
    });
  }
});

// Cart
router.get('/cart', async (req, res) => {
  try {
    const cart = await Carts.findOne({ _id: req.user.cart }).populate('books');
    res.render('cart', {
      user: req.user,
      cart: cart,
    });
  } catch (error) {
    res.render('cart', {
      user: req.user,
    });
  }
});

// Category
router.get('/history', async (req, res) => {
  try {
    const category = await Categories.findOne({ name: req.params.category }).populate('books.book');
    res.render('category', {
      user: req.user,
      category: category,
    });
  } catch (error) {
    res.render('category', {
      user: req.user,
    });
  }
});

// Book
router.get('/book', async (req, res) => {
  try {
    const book = await Books.findOne({ name: req.params.book }).populate('books.book');
    res.render('book', {
      user: req.user,
      book: book,
    });
  } catch (error) {
    res.render('book', {
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

module.exports = router;