let passportCustom = require('passport-custom');
const CustomStrategy = passportCustom.Strategy;

module.exports = function (passport) {
  passport.use('admin-local', new CustomStrategy(
    function (req, done) {
      // Do your custom user finding logic here, or set to false based on req object
      let user = "admin";
      done(null, user);
    }
  ));

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });
}