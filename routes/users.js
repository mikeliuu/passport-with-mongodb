const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//User model
const User = require('../models/User');

//login page
router.get('/login', function (req, res) {
    res.render('login')
});

//register page
router.get('/register', function (req, res) {
    res.render('register')
});

//register handle
router.post('/register', function (req, res) {
    const { name, email, password, password2 } = req.body;

    let errors = [];

    //check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'please fill in all fields' })
    };

    //check password match
    if (password !== password2) {
        errors.push({ msg: 'passwords do not match' })
    };

    //check password length
    if (password.length < 6) {
        errors.push({ msg: 'password should be at least 6 characters' })
    };

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else {
        //validation passed
        //findOne is mongoose method, find one record
        User.findOne({ email: email })
            .then(function (user) {
                if (user) {
                    //User exists
                    errors.push({ msg: 'email is already registered' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                }
                else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    //hash password
                    //salt round = 10
                    //salt round generated & passed to callback as salt
                    bcrypt.genSalt(10, function (err, salt) {
                        //hash user.password & use callback salt
                        bcrypt.hash(newUser.password, salt, function (err, hash) {
                            if (err) throw err;
                            //set password to hashed
                            newUser.password = hash;
                            //save user to database
                            newUser.save()
                                .then(function (user) {
                                    req.flash('success_msg', 'registered')
                                    res.redirect('/users/login');
                                })
                                .catch(function (err) {
                                    console.log(err);
                                })
                        })
                    })
                }
            });
    };
});

//login handle
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//logout handle
router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success_msg', 'logged out');
    res.redirect('/users/login');
});

module.exports = router;