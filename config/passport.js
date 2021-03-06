const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../app/models/mongodb/user');
const config = require('../config/main');
const jwt = require('jsonwebtoken');

// Setup work and export for the JWT passport strategy
module.exports = function(passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: config.auth.secret
  };
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    //user = jwt.verify(jwt_payload,config.secret);
    //console.log('user logged in:'+user.id);
    console.log(jwt_payload);
    console.log(jwt_payload.id);
    User.findOne({_id: jwt_payload.id}, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }));
};
