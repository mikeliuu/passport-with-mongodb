const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); //using its methods

//load user model
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
            //match user
            User.findOne({ email: email })
                .then(function(user) {
                    if(!user) {
                        return done(null, false, { message: 'email is not registered'})
                    }
                    else {
                        //match password
                        bcrypt.compare(password, user.password, function(err, isMatch) {
                            if(err) throw err;

                            if(isMatch) {
                                return done(null, user)
                            }
                            else {
                                return done(null, false, { message: 'password is not matched'})
                            }
                        })
                    }
                })
                .catch(function(err) {
                    console.log(err);
                })
        })
    )

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(null, user);
        });
    });
};